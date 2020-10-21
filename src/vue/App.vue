<template>
  <div>
    <header class="sticky-top">
      <div class="navbar navbar-expand-md navbar-dark shadow" id="navbar">
        <div class="container">
          <h4 class="navbar-brand m-0">圖片搜尋</h4>
        </div>
      </div>
    </header>
    <div class="container d-flex justify-content-center my-4">
      <input id="searchText" v-model="searchText" @change="searchText_change" />
    </div>
    <div class="info my-2">
      <div class="container d-flex justify-content-center align-items-center">
        <h6 class="text m-0" :style="{ visibility: !isLoading && data.length ? '' : 'hidden' }">-{{ data.length }}-</h6>
        <div class="loading" v-if="isLoading">
          <div class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap mt-4">
      <div class="container d-flex justify-content-center">
        <div class="itemList">
          <div class="items" v-for="(list, key) in itemList" :key="key" :style="{ width: `${100 / itemList.length}%` }">
            <div class="item" v-for="(num, key) in list" :key="key + '_' + data[num].id">
              <a
                class="photoFrame"
                :style="{
                  paddingBottom: `${100 * (data[num].img.height / data[num].img.width)}%`,
                }"
                :href="data[num].img.linksHtml"
                target="_blank"
              >
                <div
                  class="photo"
                  :style="{
                    backgroundImage: `url(${data[num].img.previewSrc})`,
                  }"
                ></div>
                <!-- <img class="w-100" :src="data[num].imgSrc" /> -->
              </a>
              <a class="name" :href="data[num].user.linksHtml" target="_blank">
                <div class="nameBg" :style="{ backgroundColor: data[num].color }"></div>
                <div class="text">
                  <div class="icon" :style="{ backgroundImage: `url(${data[num].user.profileImage})` }"></div>
                  {{ data[num].user.firstName }} {{ data[num].user.lastName }}
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
//import axios from "axios";
import Unsplash, { toJson } from "unsplash-js";
export default {
  name: "app",
  data() {
    return {
      unsplash: null,
      searchText: "",
      data: [],
      total: 0,
      isLoading: false,
      currentPage: 0,
      totalPages: 0,
      itemListHeight: [0, 0, 0, 0],
      itemList: [[], [], [], []],
      itemIndex: 0,
      isUpdatePhoto: false,
      scrollTarget: null,
    };
  },
  components: {},
  mounted() {
    //console.log(Unsplash);
    this.unsplash = new Unsplash({ accessKey: "6AHQScSb6_kYTHsNquGOwneVBRSo_Nc53gq-9-NI6OA", timeout: 500 });
    this.scrollTarget = document.getElementById("scroll");
    const scroll = () => {
      this.scroll();
    };
    window.addEventListener("resize", () => {
      this.scroll();
    });
    if (this.scrollTarget == document.body) {
      this.scrollTarget.onscroll = scroll;
    } else {
      this.scrollTarget.addEventListener("scroll", scroll);
    }
  },
  methods: {
    scroll() {
      if (!this.isLoading) {
        const target = this.scrollTarget == document.body ? document.documentElement : this.scrollTarget;
        const scrollTop = target.scrollTop;
        const max = target.scrollHeight / target.offsetHeight - 1;
        const cRate = scrollTop / target.offsetHeight;
        if (cRate >= max - 0.1) {
          if (this.currentPage + 1 < this.totalPages) {
            if (!this.isLoading && !this.isUpdatePhoto) {
              this.currentPage++;
              this.search(this.searchText);
            }
          }
        }
      }
    },
    search(keyword) {
      if (!this.isLoading && !this.isUpdatePhoto) {
        this.isLoading = true;
        this.unsplash.search
          .photos(keyword, this.currentPage + 1, 30)
          .then(toJson)
          .then((json) => {
            console.log(json);
            this.isLoading = false;
            //this.total = Math.min(json.total, 30 * 9);
            //this.totalPages = Math.min(json.total_pages, 9);
            this.total = json.total;
            this.totalPages = json.total_pages;
            this.data.push(
              ...json.results.map((el) => {
                return {
                  id: el.id,
                  color: el.color,
                  img: {
                    previewSrc: el.urls.thumb,
                    linksHtml: el.links.html,
                    width: el.width,
                    height: el.height,
                  },
                  user: {
                    firstName: el.user.first_name,
                    lastName: el.user.last_name,
                    linksHtml: el.user.links.html,
                    profileImage: el.user.profile_image.small,
                  },
                };
              })
            );
            this.updatePhoto();
          })
          .catch((error) => {
            this.isLoading = false;
            console.log(error);
          });
      }
    },
    searchText_change(ev) {
      this.data = [];
      this.itemListHeight = [0, 0, 0, 0];
      this.itemList = [[], [], [], []];
      this.itemIndex = 0;
      this.isLoading = false;
      this.isUpdatePhoto = false;
      this.currentPage = 0;
      if (this.searchText !== "") {
        this.search(this.searchText);
      }
    },
    updatePhoto() {
      this.isUpdatePhoto = true;
      if (this.itemIndex < this.data.length) {
        let num = Infinity;
        let index = -1;
        for (let i = 0; i < this.itemListHeight.length; i++) {
          if (this.itemListHeight[i] < num) {
            num = this.itemListHeight[i];
            index = i;
          }
        }
        const el = this.data[this.itemIndex];
        this.itemListHeight[index] += el.img.height / el.img.width;
        this.itemList[index].push(this.itemIndex);
        this.itemIndex++;
        setTimeout(() => {
          this.updatePhoto();
        }, 50);
      } else {
        this.isUpdatePhoto = false;
        this.scroll();
      }
    },
  },
};
</script>
<style lang="scss">
body {
  margin: 0;
}
#scroll {
  position: relative;
  display: block;
  width: 100%;
  height: 100vh;
  overflow: hidden auto;
}
.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}

@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
.GPU {
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  -o-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-perspective: 1000;
  -moz-perspective: 1000;
  -ms-perspective: 1000;
  -o-perspective: 1000;
  perspective: 1000;
}
</style>
<style lang="scss" scoped>
#searchText {
  width: 100%;
  max-width: 400px;
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
}
/*.sticky-top {
  position: sticky;
  top: 0px;
  z-index: 999;
}*/
.info {
  position: sticky;
  top: 29px;
  top: 32px;
  z-index: 1300;
  color: #c66;
  pointer-events: none;
  .text {
    position: relative;
    display: block;
  }
  .loading {
    position: absolute;
    display: block;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    .lds-ellipsis {
      position: relative;
      display: block;
      div {
        background-color: #c66;
      }
    }
  }
}
#navbar {
  backdrop-filter: blur(20px);
  background-color: rgba(52, 58, 64, 0.9);
}
.itemList {
  position: relative;
  display: flex;
  width: 100%;
  padding-bottom: 10vh;
  .items {
    position: relative;
    display: block;
    top: 0px;
    @keyframes item_animation {
      0% {
        opacity: 0;
        transform: translate(0, 50px);
      }
      100% {
        opacity: 1;
        transform: translate(0, 0);
      }
    }
    .item {
      position: relative;
      display: block;
      width: 100%;
      padding: 0.25rem;
      animation: item_animation 0.5s;
      .photoFrame {
        position: relative;
        display: block;
        //padding: 0.25rem;
        overflow: hidden;
        .photo {
          position: absolute;
          display: block;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          border: 1px solid #999;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
          transition: transform 0.5s;
        }
        &:hover {
          .photo {
            transform: scale(1.2) rotate(5deg);
          }
        }
      }
      .name {
        position: absolute;
        display: block;
        left: 0.25rem;
        right: 0.25rem;
        bottom: 0.25rem;
        .nameBg {
          position: absolute;
          display: block;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          opacity: 0.5;
        }
        .text {
          padding: 0.25rem;
          position: relative;
          display: flex;
          background-color: rgba(0, 0, 0, 0.25);
          color: #fff;
          font-size: 0.75rem;
          align-items: center;
          .icon {
            display: inline-block;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.25rem;
          }
        }
      }
    }
  }
}
</style>

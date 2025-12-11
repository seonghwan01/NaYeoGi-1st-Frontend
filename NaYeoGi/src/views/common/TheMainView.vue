<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 임시 이미지 URL
const IMG_BOOK = "https://images.unsplash.com/photo-1544716278-ca83adf3663c?auto=format&fit=crop&w=800&q=80";
const IMG_MAP = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";
const CATEGORIES = ['contenttypes', '에 들어갈', 'kmeans로','분류된 관광지', '카테고리'];

// 페이지 이동 함수
const goStorybook = () => router.push('/storybook/create'); // 추후 생성 필요
const goRecommend = () => router.push('/attraction/recommend'); // 추후 생성 필요
</script>

<template>
  <div class="container my-5">

    <!-- 상단 2분할 카드 -->
    <div class="row g-4" style="height: 500px;">

      <!-- 1. AI 스토리북 만들기 -->
      <div class="col-md-6">
        <div @click="goStorybook" class="card text-white h-100 overflow-hidden shadow-lg">
          <img :src="IMG_BOOK" class="card-img h-100" alt="Storybook background" style="object-fit: cover;">
          <div class="card-img-overlay d-flex flex-column justify-content-end bg-dark bg-opacity-50">
            <h2 class="card-title display-5 fw-bold">AI 스토리북 만들기</h2>
            <p class="card-text fs-5">사진만 올리세요.<br>나머지는 AI 작가가 완성해드립니다.</p>
          </div>
        </div>
      </div>

      <!-- 2. AI 여행지 추천 -->
      <div class="col-md-6">
        <div @click="goRecommend" class="card text-white h-100 overflow-hidden shadow-lg">
          <img :src="IMG_MAP" class="card-img h-100" alt="Recommendation background" style="object-fit: cover;">
          <div class="card-img-overlay d-flex flex-column justify-content-end bg-dark bg-opacity-50">
            <h2 class="card-title display-5 fw-bold">AI 여행지 추천</h2>
            <p class="card-text fs-5">취향 분석을 통해<br>딱 맞는 여행 코스를 설계해드립니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 카테고리 -->
    <div class="mt-5">
      <h3 class="mb-4">카테고리별 여행지</h3>
      <div class="p-4 bg-light rounded-3 border">
        <div class="row g-3">
          <div v-for="(item, idx) in CATEGORIES" :key="idx" class="col-6 col-md-3">
            <div class="card text-center shadow-sm h-100">
              <div class="card-body d-flex flex-column justify-content-center">
                <h5 class="card-title">{{ item }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

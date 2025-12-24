<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { useRouter } from 'vue-router';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';

const props = defineProps({
  storyId: {
    type: String,
    required: true,
  },
});

const store = useStorybookStore();
const router = useRouter();
const story = ref(null);
const viewerContainer = ref(null);

const showModal = ref(false);
const modalImage = ref('');

const openModal = (src) => {
  modalImage.value = src;
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  modalImage.value = '';
};

// 이미지 그룹화 로직
const groupImagesToCarousel = () => {
  if (!viewerContainer.value) return;

  const paragraphs = viewerContainer.value.querySelectorAll('p');
  
  paragraphs.forEach(p => {
    const images = p.querySelectorAll('img');
    
    // 1. 모든 이미지에 클릭 확대 이벤트 바인딩
    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        if (!img.dataset.isDragging) openModal(img.src);
      });
    });

    if (images.length >= 3) { 
      // --- [3개 이상: 캐러셀 모드] ---
      const wrapper = document.createElement('div');
      wrapper.className = 'carousel-wrapper';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-nav-btn prev';
      prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-nav-btn next';
      nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';

      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'image-scroll-container';
      
      let isDown = false;
      let startX;
      let scrollLeft;

      scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.classList.add('active');
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
      });
      scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.classList.remove('active');
      });
      scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.classList.remove('active');
        setTimeout(() => images.forEach(img => delete img.dataset.isDragging), 50);
      });
      scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) images.forEach(img => img.dataset.isDragging = "true");
        scrollContainer.scrollLeft = scrollLeft - walk;
      });

      prevBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: -400, behavior: 'smooth' }));
      nextBtn.addEventListener('click', () => scrollContainer.scrollBy({ left: 400, behavior: 'smooth' }));

      images.forEach(img => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'image-wrapper';
        img.classList.add('carousel-image');
        imgWrapper.appendChild(img.cloneNode(true));
        imgWrapper.querySelector('img').addEventListener('click', (e) => {
            if (e.target.dataset.isDragging !== "true") openModal(e.target.src);
        });
        scrollContainer.appendChild(imgWrapper);
      });
      
      wrapper.appendChild(prevBtn);
      wrapper.appendChild(scrollContainer);
      wrapper.appendChild(nextBtn);
      p.style.display = 'none';
      p.parentNode.insertBefore(wrapper, p.nextSibling);

    } else if (images.length === 2) {
      // --- [2개: 가로 나열 (화살표/드래그 없음)] ---
      const galleryContainer = document.createElement('div');
      galleryContainer.className = 'simple-gallery dual';
      
      images.forEach(img => {
        const clonedImg = img.cloneNode(true);
        clonedImg.className = 'gallery-image';
        clonedImg.addEventListener('click', () => openModal(clonedImg.src));
        galleryContainer.appendChild(clonedImg);
      });

      p.style.display = 'none';
      p.parentNode.insertBefore(galleryContainer, p.nextSibling);

    } else if (images.length === 1) {
      // --- [1개: 중앙 정렬] ---
      const wrapper = document.createElement('div');
      wrapper.className = 'single-image-wrapper';
      
      const clonedImg = images[0].cloneNode(true);
      clonedImg.className = 'single-image';
      clonedImg.addEventListener('click', () => openModal(clonedImg.src));
      
      wrapper.appendChild(clonedImg);
      p.style.display = 'none';
      p.parentNode.insertBefore(wrapper, p.nextSibling);
    }
  });
};

onMounted(async () => {
  story.value = await store.fetchStory(props.storyId);
  if (story.value && story.value.content) {
    await nextTick();
    if (viewerContainer.value) {
      new Viewer({ el: viewerContainer.value, initialValue: story.value.content });
      setTimeout(groupImagesToCarousel, 100);
    }
  }
});

const onEdit = () => {
  if (!story.value) return;
  router.push(`/storybook/edit/${story.value.storyId}`);
};
const onDelete = () => {
  if (window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
    store.deleteStory(props.storyId);
  }
};
const onTogglePublic = async () => {
  if (!story.value) return;
  const newStatus = !story.value.isPublic;
  const result = await store.updateStoryVisibility(props.storyId, newStatus);
  if (result && typeof result.isPublic === 'boolean') {
    story.value.isPublic = result.isPublic;
    alert(`스토리가 ${story.value.isPublic ? '공개' : '비공개'} 상태로 변경되었습니다.`);
  }
};
</script>

<template>
  <div class="page-wrapper bg-joyful-gradient min-vh-100 py-5">
    
    <div v-if="store.isLoading" class="loading-overlay">
       <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status"></div>
       <p class="mt-4 text-white fs-4 fw-light">불러오는 중...</p>
    </div>

    <div v-if="story" class="container" style="max-width: 900px;">
      
      <article class="glass-panel p-4 p-md-5 mb-5 fade-in-up">
        <header class="border-bottom pb-4 mb-4 text-center">
          <div class="d-flex justify-content-center align-items-center gap-2 mb-3">
             <span v-if="story.isPublic" class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">공개</span>
             <span v-else class="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2">비공개</span>
             <span class="text-muted small ms-2"><i class="bi bi-eye me-1"></i>{{ story.hit }}</span>
          </div>
          <h1 class="display-5 fw-bold mb-3 text-dark">{{ story.title }}</h1>
          <p class="text-muted">
            <span class="fw-bold text-dark">{{ story.writerName }}</span> · {{ story.createdDate }}
          </p>
        </header>

        <div class="story-content mt-4">
             <div ref="viewerContainer"></div>
        </div>
      </article>
      
      <div style="height: 100px;"></div>

      <div class="floating-action-bar shadow-lg">
        <button class="btn btn-action-secondary rounded-pill px-4 me-2" @click="router.push('/my-stories')">
           <i class="bi bi-arrow-left me-1"></i> 목록
        </button>
        <div class="vr mx-2 bg-secondary opacity-25"></div>
        
        <button class="btn btn-icon rounded-circle me-1" @click="onEdit" data-tooltip="수정하기">
           <i class="bi bi-pencil-fill text-primary"></i>
        </button>
        <button class="btn btn-icon rounded-circle me-1" @click="onTogglePublic" :data-tooltip="story.isPublic ? '비공개로 전환' : '공개하기'">
           <i class="bi" :class="story.isPublic ? 'bi-lock-fill text-warning' : 'bi-globe text-success'"></i>
        </button>
        <button class="btn btn-icon rounded-circle" @click="onDelete" data-tooltip="삭제하기">
           <i class="bi bi-trash-fill text-danger"></i>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="image-modal-overlay" @click="closeModal">
        <button class="modal-close-btn" @click="closeModal"><i class="bi bi-x-lg"></i></button>
        <img :src="modalImage" class="modal-content-img" @click.stop />
      </div>
    </Teleport>
  </div>
</template>

<style>
/* --- Design System --- */
@keyframes gradient-move { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
/* 최적화: backdrop-filter 제거 (성능 저하 원인) -> 투명도 있는 흰색 배경 사용 */
.glass-panel { background: rgba(255, 255, 255, 0.95); border-radius: 2rem; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1); }
.fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- Carousel & Gallery --- */
.carousel-wrapper { position: relative; margin: 2.5rem 0; display: flex; align-items: center; }
.carousel-wrapper:hover .carousel-nav-btn { opacity: 1; }
.carousel-nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
  /* 최적화: transition 속성 명시 */
  cursor: pointer; z-index: 10; opacity: 0; transition: opacity 0.3s ease, background-color 0.2s;
}
.carousel-nav-btn.prev { left: -20px; } .carousel-nav-btn.next { right: -20px; }

.image-scroll-container { display: flex; overflow-x: auto; gap: 1.5rem; padding: 1rem 5px; width: 100%; cursor: grab; scroll-behavior: smooth; scrollbar-width: none; align-items: center; }
.image-scroll-container::-webkit-scrollbar { display: none; }
.image-scroll-container.active { cursor: grabbing; scroll-behavior: auto; }

/* 3개 이상: Wrapper는 이미지의 자연스러운 너비를 따름 */
.image-wrapper { flex: 0 0 auto; height: 350px; width: auto; user-select: none; border-radius: 1rem; display: flex; align-items: center; }
/* 이미지 자체: 높이를 꽉 채우고 너비는 비율에 맞게 */
.carousel-image { height: 100%; width: auto; max-width: none; border-radius: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }

/* 2개일 때: 화살표 없이 가로 나열 */
.simple-gallery.dual { display: flex; justify-content: center; gap: 1.5rem; margin: 2.5rem 0; }
.gallery-image { width: 45%; max-height: 350px; object-fit: contain; background-color: rgba(0,0,0,0.03); border-radius: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: zoom-in; }

.single-image-wrapper { text-align: center; margin: 2.5rem 0; }
.single-image { display: inline-block; max-width: 90%; max-height: 500px; height: auto; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); cursor: zoom-in; }

/* --- Floating Bar & Tooltip --- */
.floating-action-bar { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.527); backdrop-filter: blur(10px); padding: 0.75rem 1rem; border-radius: 50rem; border: 1px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; z-index: 1000; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.btn-icon { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fac4; border: 1px solid #e9ecef; /* 최적화: transition 속성 명시 */ transition: transform 0.2s, background-color 0.2s; }
.btn-icon:hover { background-color: #e9ecef9f; transform: translateY(-2px); }

[data-tooltip]::after { content: attr(data-tooltip); position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%) translateY(10px); background: rgba(33, 37, 41, 0.9); color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.7rem; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; }
[data-tooltip]:hover::after { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

/* --- Modal --- */
.image-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center; align-items: center; z-index: 99999; }
.modal-content-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
.modal-close-btn { position: absolute; top: 30px; right: 40px; background: none; border: none; color: white; font-size: 2.5rem; cursor: pointer; }

/* --- Typography --- */
.story-content h1, .story-content h2 { font-weight: 800; color: #2c3e50; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f1f3f5; }
.story-content h3 { font-weight: 700; color: #343a40; margin-top: 2rem; display: flex; align-items: center; }
.story-content h3::before { content: ''; display: inline-block; width: 6px; height: 24px; background-color: #23a6d5; margin-right: 10px; border-radius: 3px; }
.story-content p { font-size: 1.1rem; line-height: 1.8; color: #495057; word-break: keep-all; }
.loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); backdrop-filter: blur(5px); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; }
</style>
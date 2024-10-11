import { SidebarManager } from '../module/aside.js';
import { ModalManager } from '../module/modal.js';
import { TabManager } from '../module/tab.js';

// 주요 UI 컴포넌트와 유틸리티 초기화
class ApplicationInit {
  // DOMContentLoaded 이벤트 발생 시 컴포넌트 초기화
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initComponents();
    });
  }

  // UI 컴포넌트 생성 및 필요한 유틸리티 함수 조건부 로드
  async initComponents() {
    window.sidebarManager = new SidebarManager();  // 사이드바 초기화
    await window.sidebarManager.initSidebar();     // 사이드바가 로드된 후 LNB 활성화
    window.sidebarManager.lnbActiveByBodyRoute();  // LNB 메뉴 활성화 (data-route 값 기반)

    window.modalManager = new ModalManager();      // 모달 초기화
    window.tabManagers = [new TabManager()];       // 탭 초기화
  
    const loadModule = async (selector, funcName) => {
      if (selector && document.querySelector(selector)) {
        const module = await import('../module/utils.js');
        module[funcName](selector);
      }
    };
  
    // 필요 함수만 로드
    await loadModule('.btn-options .btn', 'setDateButtons');    // 날짜 옵션 버튼 설정
    await loadModule('.tooltip', 'toggleTooltips');             // 툴팁 활성화
    await loadModule('.ui-counter', 'setNumberControls');       // 숫자 입력 컨트롤 설정
    await loadModule('.form-search', 'setSearchForm');          // 검색 폼 기능 설정
    await loadModule('.form-input', 'setPasswordForm');         // 패스워드 폼 기능 설정
  
    // 필수 실행 함수 개별 호출
    const { updateFormLabels } = await import('../module/utils.js');
    updateFormLabels();  // 폼 라벨 상태 업데이트
  }
}

// 인스턴스 생성
new ApplicationInit();
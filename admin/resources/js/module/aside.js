export class SidebarManager {
  constructor(headerSelector = '.base-header', asideSelector = '.base-aside') {
    this.headerSelector = headerSelector;
    this.asideSelector = asideSelector;
    this.sidebarLoaded = false;

    this.loadHeader(); 
    this.initSidebar(); 
  }

  // 헤더 html을 비동기 로드하여 지정된 요소에 삽입
  async loadHeader() {
    const headerElement = document.querySelector(this.headerSelector);
    if (headerElement) {
      try {
        const response = await fetch('../../html/includes/header.html');
        if (!response.ok) throw new Error(`헤더 로드 실패: ${response.statusText}`);
        headerElement.innerHTML = await response.text();
      } catch (error) {
        console.error('헤더 로드 에러:', error);
        headerElement.innerHTML = '<p>헤더 내용 로드 실패.</p>';
      }
    }
  }

  // 사이드바 초기화 및 클릭 이벤트 설정
  async initSidebar() {
    await this.loadSidebar();
    this.sidebarLoaded = true;
    console.log('사이드바 로드 성공');
    this.lnbActiveByBodyRoute();  // LNB 메뉴 활성화
    this.setupLnbClickEvents();   // LNB 클릭 이벤트 설정
    this.setupBookmarkEvents();   // 북마크 버튼 이벤트 설정
    this.setupHistoryEvents();    // 히스토리 버튼 이벤트 설정
  }

  // 사이드바 HTML을 비동기 로드하여 지정된 요소에 삽입
  async loadSidebar() {
    const asideElement = document.querySelector(this.asideSelector);

    if (asideElement && !this.sidebarLoaded) {
      try {
        const fetchUrl = asideElement.classList.contains('guide')
          ? '../../html/includes/lnb_guide.html'
          : '../../html/includes/lnb.html';

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`사이드바 로드 실패: ${response.statusText}`);

        const html = await response.text();
        asideElement.innerHTML = html;
      } catch (error) {
        console.error('사이드바 로드 에러:', error);
        asideElement.innerHTML = '<p>사이드바 내용 로드 실패.</p>';
      }
    }
  }

  /**
   * body의 data-route 속성 값을 기준으로 LNB 메뉴 활성화
   * LNB 항목 및 서브 항목을 순회하여 일치하는 항목에 클래스 추가
  */
  lnbActiveByBodyRoute() {
    const bodyRoute = document.body.getAttribute('data-route');
    if (!bodyRoute) {
      console.warn('data-route 속성이 body 요소에 설정되지 않음');
      return;
    }

    const lnbItems = document.querySelectorAll('.lnb-item');
    lnbItems.forEach(item => {
      const route = item.getAttribute('data-route');
      const subItems = item.querySelectorAll('.lnb-subitem');

      if (route === bodyRoute) {
        this.activateLnbItem(item);
      }

      subItems.forEach(subItem => {
        if (subItem.getAttribute('data-route') === bodyRoute) {
          this.activateLnbItem(item);
          subItem.classList.add('is-active');
        }
      });

      const subMenu = item.querySelector('.lnb-sub');
      if (!subMenu) {
        item.classList.add('none');
      }
    });
  }

  /**
     * LNB 링크 요소에 클릭 이벤트 설정
     * 각 링크 클릭 시 handleLnbLinkClick 메서드 호출
   */
  setupLnbClickEvents() {
    document.querySelectorAll('.lnb-link').forEach(link => {
      link.addEventListener('click', event => this.handleLnbLinkClick(event));
    });
  }

  /**
    * LNB 링크 클릭 시 호출, 하위 메뉴가 있는 경우 열거나 닫기 처리
    * 하위 메뉴가 없을 경우 해당 링크로 이동
  */
  handleLnbLinkClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const lnbItem = link.closest('.lnb-item');
    const subMenu = lnbItem.querySelector('.lnb-sub');

    if (subMenu) {
      const isOpen = lnbItem.classList.toggle('is-open');
      lnbItem.classList.toggle('is-active', isOpen);
      this.setSubMenuHeight(lnbItem, !isOpen);
    } else {
      lnbItem.classList.add('none');
      window.location.href = link.getAttribute('href');
    }
  }

  /**
    * LNB 서브 메뉴 높이를 조정하여 애니메이션 효과 적용
    * 서브 메뉴를 열거나 닫을 때 max-height 속성 조정
  */
  setSubMenuHeight(lnbItem, isClosing = false) {
    const subMenu = lnbItem.querySelector('.lnb-sub');
    if (subMenu) {
      subMenu.style.maxHeight = isClosing ? `${subMenu.scrollHeight}px` : `${subMenu.scrollHeight}px`;
      requestAnimationFrame(() => {
        subMenu.style.maxHeight = isClosing ? '0' : 'none';
      });
    }
  }

  activateLnbItem(lnbItem) {
    lnbItem.classList.add('is-active', 'is-open');
    this.setSubMenuHeight(lnbItem);
  }

  // 북마크 버튼 이벤트 설정
  setupBookmarkEvents() {
    document.querySelectorAll('.btn-bookmark').forEach(button => {
      button.addEventListener('click', () => {
        button.classList.toggle('on');
      });
    });
  }

  // 히스토리 버튼 이벤트 설정
  setupHistoryEvents() {
    document.querySelectorAll('.history-list .btn-close').forEach(button => {
      button.addEventListener('click', (event) => {
        const listItem = button.closest('li');
        if (listItem) {
          listItem.remove();
        }
      });
    });
  }
}

// SidebarManager 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarManager = new SidebarManager();
});
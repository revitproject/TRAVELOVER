export class ModalManager {
  constructor() {
    this.modalStack = [];
    this.focusableElementsSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
    this.initModal();
  }

  // 모달 초기화
  initModal() {
    document.body.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('[data-modal="open"]');
      const closeTrigger = e.target.closest('[data-modal="close"]');

      if (openTrigger) {
        const modalId = openTrigger.getAttribute('data-url') || openTrigger.getAttribute('href').substring(1);
        this.openModalById(modalId);
        e.preventDefault();
      } else if (closeTrigger) {
        this.closeModal(closeTrigger.closest('.modal'));
        e.preventDefault();
      }
    });

    // 초기 상태에서 이미 열려있는 모달 처리
    document.querySelectorAll('.modal.is-show').forEach((modal) => {
      this.openModal(modal);
    });
  }

  // 모달 열기
  openModal(modal, cancelFn = null, confirmFn = null) {
    if (!modal) {
      console.error('모달 요소가 없습니다.');
      return;
    }

    this.modalStack.push(modal);
    modal.classList.add('is-show');
    modal.style.zIndex = 1000 + this.modalStack.length * 10;

    this.updateDimmedElement();
    this.setupFocusTrap(modal);
    this.setupButtonListeners(modal, cancelFn, confirmFn);
  }

  // ID로 모달 열기
  openModalById(modalId, cancelFn = null, confirmFn = null) {
    const modal = document.getElementById(modalId.replace('#', ''));
    if (modal) {
      this.openModal(modal, cancelFn, confirmFn);
    } else {
      console.error(`ID가 ${modalId}인 모달을 찾을 수 없습니다.`);
    }
  }

  // alert 모달
  alert(title, message, confirmFn = null, confirmBtnText = '확인') {
    this.initDialog();
    // 확인 버튼 콜백이 없는 경우 기본 콜백으로 모달 닫기 기능 추가
    const defaultConfirmFn = (modal) => this.closeModal(modal);
    this.setupDialog('alert', title, message, null, confirmFn || defaultConfirmFn, null, confirmBtnText);
    this.openModal(this.dialogContainer, null, confirmFn || defaultConfirmFn);
  }

  // confirm 모달
  confirm(title, message, cancelFn, confirmFn, cancelBtnText = '취소', confirmBtnText = '확인') {
    this.initDialog();
    this.setupDialog('confirm', title, message, cancelFn, confirmFn, cancelBtnText, confirmBtnText);
    this.openModal(this.dialogContainer, cancelFn, confirmFn);
  }

  // 다이얼로그 모달 설정
  setupDialog(type, title, message, cancelFn, confirmFn, cancelBtnText, confirmBtnText) {
    this.dialogTitle.textContent = title;
    this.dialogText.textContent = message;
    this.toggleCancelButton(type === 'confirm');
    this.updateButtonLabels(cancelBtnText, confirmBtnText);
  }

  // 다이얼로그 모달 초기화
  initDialog() {
    if (this.dialogContainer) return;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-inner">
        <div class="modal-header">
          <strong class="modal-title"></strong>
        </div>
        <div class="modal-body">
          <p class="modal-msg"></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn is-footer is-true">확인</button>
          <button type="button" class="btn is-footer is-false">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.dialogContainer = modal;

    this.dialogTitle = this.dialogContainer.querySelector('.modal-title');
    this.dialogText = this.dialogContainer.querySelector('.modal-msg');
    this.trueBtn = this.dialogContainer.querySelector('.is-true');
    this.falseBtn = this.dialogContainer.querySelector('.is-false');
  }

  // 취소 버튼 표시/숨기기
  toggleCancelButton(show) {
    this.falseBtn.style.display = show ? 'inline-flex' : 'none';
  }

  // 버튼 텍스트 업데이트
  updateButtonLabels(cancelBtnText, confirmBtnText) {
    if (this.falseBtn) {
      this.falseBtn.textContent = cancelBtnText || '취소';
    }
    if (this.trueBtn) {
      this.trueBtn.textContent = confirmBtnText || '확인';
    }
  }

  // 모달 버튼 설정 (콜백 실행 후 모달 닫기 여부는 콜백에서 결정)
  setupButtonListeners(modal, cancelFn, confirmFn) {
    const cancelButton = modal.querySelector('.is-false');
    const confirmButton = modal.querySelector('.is-true');

    // 취소 버튼 리스너 설정 (취소 버튼이 있는 경우에만)
    if (cancelButton) {
      cancelButton.onclick = () => {
        if (typeof cancelFn === 'function') {
          cancelFn(modal);
        }
      };
    }

    // 확인 버튼 리스너 설정 (확인 버튼이 있는 경우에만)
    if (confirmButton) {
      confirmButton.onclick = () => {
        if (typeof confirmFn === 'function') {
          confirmFn(modal);
        }
      };
    }
  }

  // 모달 닫기
  closeModal(modal) {
    if (!modal) {
      console.error('닫을 모달이 없습니다.');
      return;
    }

    modal.classList.remove('is-show');
    this.modalStack.pop();
    this.updateDimmedElement();
    this.removeFocusTrap(modal);
  }

  // 포커스 트랩 설정
  setupFocusTrap(modal) {
    const focusableElements = modal.querySelectorAll(this.focusableElementsSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const trap = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', trap);
    modal._focusTrap = trap;
    firstFocusable?.focus();
  }

  // 포커스 트랩 제거
  removeFocusTrap(modal) {
    if (modal._focusTrap) {
      modal.removeEventListener('keydown', modal._focusTrap);
      delete modal._focusTrap;
    }
  }

  // 딤드 요소 업데이트
  updateDimmedElement() {
    let dimmed = document.querySelector('.modal-dimmed');

    if (this.modalStack.length > 0) {
      if (!dimmed) {
        dimmed = document.createElement('div');
        dimmed.classList.add('modal-dimmed');
        document.body.appendChild(dimmed);
      }
      dimmed.style.zIndex = this.modalStack[this.modalStack.length - 1].style.zIndex - 1;
    } else if (dimmed) {
      dimmed.remove();
    }
  }

  // 현재 활성 모달 닫기
  closeCurrentModal() {
    const activeModal = this.modalStack[this.modalStack.length - 1];
    if (activeModal) {
      this.closeModal(activeModal);
    } else {
      console.error('닫을 모달이 없습니다.');
    }
  }

  // 모든 모달 닫기
  closeAllModals() {
    while (this.modalStack.length) {
      this.closeModal(this.modalStack.pop());
    }
  }
}

// ModalManager 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.modalManager = new ModalManager();
});
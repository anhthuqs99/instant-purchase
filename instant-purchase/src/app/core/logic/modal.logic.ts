import { ElementRef } from '@angular/core';

export function displayModal(modalRef: ElementRef, display: boolean) {
  /**
   * @param modalRef the modal HTML element.
   * @param display Is display the modal or dismiss it.
   */
  if (modalRef && modalRef.nativeElement) {
    const modalElement = modalRef.nativeElement;
    if (display) {
      modalElement.classList.add('display');
    } else {
      modalElement.classList.remove('display');
    }
  }
}

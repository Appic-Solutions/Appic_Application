'use client';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';

function Modal({ children, active }) {
  return (
    <div className={darkModeClassnamegenerator(`modal ${active && 'active'}`)}>
      <div className="bg">
        <div className="container">{children}</div>
      </div>
    </div>
  );
}

export default Modal;

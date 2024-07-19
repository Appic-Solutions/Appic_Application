'use client';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import { useSelector } from 'react-redux';

function Modal({ children, active, forMobile }) {
  return (
    <div className={darkModeClassnamegenerator(`modal ${active && 'active'} ${forMobile == true && 'mobile'}`)}>
      <div className="bg">
        <div className="container">{children}</div>
      </div>
    </div>
  );
}

export default Modal;


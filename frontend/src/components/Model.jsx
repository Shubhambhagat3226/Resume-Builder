import { modalStyles as st } from '../assets/dummystyle';
import { RxCross2 } from "react-icons/rx";
import Login from '../components/Login';
import Signup from '../components/SignUp';

function Modal({ children, isOpen, onClose, title, hideHeader }) {

    if (!isOpen) return null;

    return (
        <div className={st.overlay}>
            <div className={st.container}>
                {
                    !hideHeader && (
                        <div className={st.header}>
                            <h3 className={st.title}>
                                {title}
                            </h3>
                        </div>
                    )
                }

                <button type='button' className={st.closeButton} onClick={onClose}>
                    <RxCross2 size={20} />
                </button>
                <div className={st.body}>{children}</div>
            </div>
        </div >
    )
}

export default Modal

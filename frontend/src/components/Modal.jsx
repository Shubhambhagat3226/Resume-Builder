import { modalStyles as st } from '../assets/dummystyle';
import { RxCross2 } from "react-icons/rx";
import Login from './Login';
import Signup from './SignUp';

function Modal({ children, isOpen, onClose, title, hideHeader, actionBtnIcon = null, showActionBtn, actionBtnText, onActionClick = () => { }, maxWidth = 'max-w-lg'
}) {

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

                            {showActionBtn && (
                                <button className={st.actionButton} onClick={onActionClick}>
                                    {actionBtnIcon}
                                    {actionBtnText}
                                </button>
                            )}

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

export default Modal;

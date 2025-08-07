import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext';
import Navbar from './Navbar';

const DashboardLayout = ({ children, activeMenu }) => {

    const { user } = useContext(UserContext);

    return (
        <div>
            <Navbar activeMenu={activeMenu} />
            {user && <div className='container mx-auto py-4'>
                {children}
            </div>}
        </div>
    )
}

export default DashboardLayout

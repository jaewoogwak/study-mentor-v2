import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [err, setErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            // firebase auth에 user 추가
            const res = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // firebase db에 user 추가
            const docRef = await addDoc(collection(db, 'users'), {
                email,
                uid: res.user.uid,
            });

            // firebase db credits 추가
            const docRefCredits = await addDoc(collection(db, 'credits'), {
                email,
                credit: 10,
            });

            navigate('/login');
        } catch (err) {
            console.log('[Err]', err);
            setErr(true);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            user && navigate('/');
        });
    }, []);

    return (
        <div className='formContainer'>
            <div className='formWrapper'>
                <span className='logo'>Lama Chat</span>
                <span className='title'>Register</span>
                <form onSubmit={handleSubmit}>
                    <input required type='email' placeholder='email' />
                    <input required type='password' placeholder='password' />

                    <button disabled={loading}>Sign up</button>

                    {err && <span>Something went wrong</span>}
                </form>
                <p>
                    You do have an account? <Link to='/login'>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

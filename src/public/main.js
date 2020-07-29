
document.addEventListener('DOMContentLoaded', () => {
    let accessToken = '';
    let csrfToken = '';

    const loginBtn = document.querySelector('#login-btn');
    const getProfileBtn = document.querySelector('#get-profile-btn');
    const refreshTokenBtn = document.querySelector('#refresh-token-btn');

    loginBtn.addEventListener('click', e => {
        axios.post('/users/login', {
            email: 'jakubpadlo4@gmail.com',
            password: 'Rourluse1'
        })
            .then(r => {
                accessToken = r.data.token;
                csrfToken = r.data.csrfToken;
                localStorage.setItem('csrfToken', r.data.csrfToken);//
                console.log('/users/login -> ok');
            })
            .catch(e => {
                console.log('error', e);
            });
    });

    getProfileBtn.addEventListener('click', e => {
        axios.get('/users/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'CSRF-Token': localStorage.getItem('csrfToken'),
            }
        })
            .then(r => {
                console.log('/users/me-> ok');
                // console.log(r);
            })
            .catch(e => {
                console.log('error', e);
            });
    });

    refreshTokenBtn.addEventListener('click', e => {
        axios.post('/users/refreshToken', {}, {
            headers: {
                'CSRF-Token': localStorage.getItem('csrfToken'),
            }
        })
            .then(r => {
                accessToken = r.data.token;
                localStorage.setItem('csrfToken', r.data.csrfToken);//
                console.log('/users/refreshToken -> ok');
                console.log(r.data);
            })
            .catch(e => {
                console.log('error', e);
            });
    });
});



const {Router, json} = require('express');
const {isAuthenticate} = require('../middleware/auth');
const {getLoginInfos, getUserById, deleteLoginInfo} = require('../database');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/dashboard',isAuthenticate, async (req, res) => {
    let user_id = req.session.user;
    let user = await getUserById(user_id);
    let loginInfos =  await getLoginInfos(user_id);
    loginInfos = loginInfos.reverse();
    let token = jwt.sign({user_id}, fs.readFileSync(__dirname+"/../../certs/privateKey.pem"), {
        algorithm: 'RS256',
        expiresIn: 60*60,
        allowInsecureKeySizes: true
    })
    res.render('dashboard', {loginInfos, name: user.username, token});
})

router.post('/logout', async (req, res) => {
    await req.session.destroy();
    await deleteLoginInfo(req.sessionID)
    return res.redirect('/');
})

router.post('/revoke', async (req, res)=>{
    let device_id = req.body.id;
    await deleteLoginInfo(device_id)
    if(req.signedCookies.device_id === device_id){
        res.clearCookie('device_id');
        await req.session.destroy();
    }
    return res.redirect('/dashboard');
})

router.post('/verify', async (req, res)=>{
    let token = req.body.token;
    try{
        let decoded = jwt.verify(token, fs.readFileSync(__dirname+"/../../certs/publicKey.pem"), {
            algorithms: ['RS256'],
            allowInsecureKeySizes: true
        });
        let user = await getUserById(decoded.user_id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({username: user.username, email: user.email});
    }catch(err){
        return res.status(403).json({message: "Invalid token"});
    }
})


module.exports = router;
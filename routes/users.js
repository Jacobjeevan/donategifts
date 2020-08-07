/*
    CHANGES MADE: we will just use /routes and mount on app.js
    I moved the controllers and merged them into one file here.
*/

//NPM DEPENDENCIES
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require('mongoose');

//IMPORT USER MODEL
const User = require('../models/User');

//LOAD STATIC VIEWS
router.use(express.static('public'));
router.use(express.static('assets'));


// @desc    Render index.html (home)
// @route   GET '/users'
// @access  Public
// @tested 	Yes
router.get('/', (req, res) => {
    try {
        res.status(200).sendFile( path.join( __dirname, '../public', 'index.html' )); 
    } catch (error) {
        res.status(400).send(JSON.stringify({
			success: false,
			error: err
		}));
    }
});

// @desc    Render signup.html
// @route   GET '/users/signup'
// @access  Public
// @tested 	Yes
router.get('/signup', (req, res) => {
    try {
        res.status(200).sendFile( path.join( __dirname, '../public', 'signup.html' )); 
    } catch (error) {
        res.status(400).send(JSON.stringify({
			success: false,
			error: err
		}));
    }
});

// @desc    
// @route   GET '/users/login'
// @access  Private
// @tested 	Not yet
router.get('/login', (req, res) => {
    try {
        res.status(200).sendFile( path.join( __dirname, '../public', 'login.html' ));
    } catch (error) {
        res.status(400).send(JSON.stringify({
			success: false,
			error: err
		}));
    }
});

// @desc    Render profile.html, grabs userId and render ejs data in static template
// @route   GET '/users/profile/:id'
// @access  Private, only users
// @tested 	Yes
// TODO: add conditions to check userRole and limit 'createWishCard' access to 'partners' only
router.get('/profile/:id', async (req, res) => {
    try {
		var userId = req.params.id;
		const userData = await User.findOne({_id: userId});
		res.render((path.join( __dirname, '../public', 'profile.html' )), {user: userData});
    } catch (error) {
        res.status(400).send(JSON.stringify({
			success: false,
			error: err
		}));
	}
});


// @desc    Create a newUser, hash password, issue session
// @route   POST '/users/signup'
// @access  Public
// @tested 	Yes
// TODO: display this message in signup.html client side as a notification alert
router.post('/signup', async (req, res) => {
	const { fName, lName, email, password, userRole} = req.body;
	const candidate = await User.findOne({email: email});
	if (candidate) {
		return res.status(409).send('This email is already taken. Try another');
	} else {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = new User({
			fName,
			lName,
			email,
			password: hashedPassword,
			userRole
		});
		var userId = mongoose.Types.ObjectId(newUser._id);
		req.session.userId = userId;
		try {
			console.log(newUser); 
			await newUser.save();
			return res.redirect(`/users/profile/${userId}`);
		} catch (err) {
			console.log(err);
		}
	}
});

// @desc    Render login.html
// @route   POST '/users/login'
// @access  Public
// @tested 	Not yet
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
	const user = await User.findOne({ email: email });
	if (user) {
		if (await bcrypt.compare(password, user.password)) {
			req.session.userId = user.id;
			return res.redirect(`/users/profile/${user._id}`);
		}
	}
	res.redirect('/users/login');
});

// @desc    Render login.html
// @route   POST '/users/logout'
// @access  Public
// @tested 	Not yet
// TODO: connect this route with the 'Log Out' button
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
		if (err) {
			return res.redirect('/users/profile');
		}
		res.clearCookie(process.env.SESS_NAME);
		res.redirect('/users/login');
	});
});

module.exports = router;


// const redirectLogin = (req, res, next) => {
//     if (!req.session.userId) {
//         res.redirect('/login');
//     } else {
//         next();
//     }
// }

// const redirectProfile = (req, res, next) => {
//     if (req.session.userId) {
//         res.redirect('/profile');
//     } else {
//         next();
//     }
// }

// const {
//     getUsersRoot,
//     getUsersProfile,
//     getUsersLogin,
//     getUsersRegister,
//     postUsersLogin,
//     postUsersRegister,
//     postUsersLogout
// } = require('../controllers/users');

// const User = require('../models/User');
// const { Router } = require('express');

// const router = express.Router({
//     mergeParams: true
// });


// router
//     .route('/')
//     .get(getUsersRoot);

// router
//     .route('/profile')
//     .get(redirectLogin, getUsersProfile);

// router
//     .route('/login')
//     .get(redirectProfile, getUsersLogin);

// router
//     .route('/register')
//     .get(redirectProfile, getUsersRegister);

// router
//     .route('/login')
//     .post(redirectProfile, postUsersLogin);

// router
//     .route('/register')
//     .post(redirectProfile, postUsersRegister);

// router
//     .route('/logout')
//     .post(redirectLogin, postUsersLogout);
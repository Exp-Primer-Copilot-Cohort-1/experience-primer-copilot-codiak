// Create web server

// Load modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Comments = require('../models/comments');

// Create router
const commentRouter = express.Router();

// Use body-parser
commentRouter.use(bodyParser.json());

// Route '/'
commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, (req, res, next) => {
        Comments.find(req.query)
            .populate('author')
            .then((comments) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comments);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        // Check if user is admin
        if (req.user.admin) {
            // User is admin
            Comments.create(req.body)
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                }, (err) => next(err))
                .catch((err) => next(err));
        } else {
            // User is not admin
            err = new Error('You are not authorized to do this!');
            err.status = 403;
            return next(err);
        }
    })
    .put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        // Check if user is admin
        if (req.user.admin) {
            // User is admin
            res.statusCode = 403;
            res.end('PUT operation not supported on /comments');
        } else {
            // User is not admin
            err = new Error('You are not authorized to do this!');
            err.status = 403;
            return next(err);
        }
    })
    .delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        // Check if user is admin
        if (req.user.admin) {
            // User is admin
            Comments.remove({})
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp
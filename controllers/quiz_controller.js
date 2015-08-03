var models = require('../models/models.js');

// Autoload - factoriza el c�digo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  if (req.query.search) {
  var search = '%' + req.query.search.replace(/\s/g,"%") + '%';
  models.Quiz.findAll({
	where: ["pregunta like ?", search],
	order: [['pregunta', 'ASC']]}
	).then(function(quizes) {	
	res.render('quizes/index', {quizes: quizes, errors: []});
}).catch(function(error) {next(error);});
  }else{
	models.Quiz.findAll().then(function(quizes) {
		res.render('quizes/index', {quizes: quizes, errors: []});
	}).catch(function(error) {next(error);});
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirecci�n HTTP a lista de preguntas (URL relativo)
    }
  );
};

exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tem�tica"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};


// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );
  var errors = quiz.validate();
  if (errors) {
		var i = 0;
		var errores = new Array();

		for (var prop in errors) {
			errores[i++]={message: errors[prop]};
		}        
		res.render('quizes/new', {quiz: quiz, errors: errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');
		});     // res.redirect: Redirecci�n HTTP a lista de preguntas
	}
};
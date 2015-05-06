var express = require('express');
var app = express();
var url = require('url');
var MongoClient = require('mongodb').MongoClient;

app.get('/insertRandMatrix', function (req, res) {
	//Couldnt use mongoose to store multidimentional arrays
	MongoClient.connect('mongodb://localhost:3001/decks', function(er, db) {
		var matrix = getCardValueMatrix();
		var calculatedScore = getScore(matrix);
		db.collection('deck_table').save({score: calculatedScore, deck: matrix}, {w: 1}, function(err, status){
			res.send({score: calculatedScore, deck: matrix});
		});

	});
	
});

app.get('/findMatrix', function (req, res) {
	MongoClient.connect('mongodb://localhost:3001/decks', function(er, db) {
		var output = db.collection('deck_table').find().toArray(function (err, result){
			var urlParts = url.parse(req.url, true);
			var query = urlParts.query;
			res.send(result[query.n]);
		});
		
	});
	
});

app.get('/getAvgScore', function (req, res) {
	MongoClient.connect('mongodb://localhost:3001/decks', function(er, db) {
		var output = db.collection('deck_table').find().toArray(function (err, result){
			res.send(result);
		});
		
	});
	
});

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/matrix.html');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
});



function getScore(matrix)
{
	var score = 0;
	for (var i = 0; i < 4; i++)
	{
		for (var j = 0; j < 13; j++)
		{
			if (matrix[i][j][0] == i)
			{
				score++;
			}
			if (matrix[i][j][1] == j)
			{
				score++;
			}
		}
	}
	return score;
}

function randomizeSuit(matrix, index, col, j)
{
	var currTaken = new Array();
	var takenPos = 0;
	for (var i = 0; i < 4; i++)
	{
		for (var deckPos = 0; deckPos < 13; deckPos++)
		{
			if (matrix[i][deckPos][1] == j && matrix[i][deckPos][0] != -1)
			{
				currTaken[takenPos] = matrix[i][deckPos][0];
				takenPos++;
				break;
			}
		}

	}

	var continueLoop = true;
	while(continueLoop)
	{
		var rand = parseInt((Math.random() * 100) % 4);
		var isInTaken = false;
		for (var i = 0; i < currTaken.length; i++)
		{
			if (currTaken[i] == rand)
			{
				isInTaken = true;
			}
		}
		if (isInTaken)
		{
			continueLoop = true;
		}
		else
		{
			matrix[col][index][0] = rand;
			continueLoop = false;
		}
	}
	
}

function getCardValueMatrix()
{
	var matrix = new Array();

	for (var i = 0; i < 4; i++)
	{
		matrix[i] = new Array();
		for (var j = 0; j < 13; j++)
		{
			matrix[i][j] = new Array();
			matrix[i][j][0] = -1;
			matrix[i][j][1] = -1;
		}
	}
	
	for (var i = 0; i < 4; i++)
	{

		var passedValue = true;
		var j = 0;
		while(passedValue)
		{
			var index = parseInt((Math.random() * 100) % 13);
			if (matrix[i][index][1] == -1)
			{
				randomizeSuit(matrix, index, i, j);
				matrix[i][index][1] = j;
				j++;
			}
			else if (Math.random() > .5)
			{
				for (var k = index; k < 13; k++)
				{
					if (matrix[i][k][1] == -1)
					{
						randomizeSuit(matrix, k, i, j);
						matrix[i][k][1] = j;
						j++;
						break;
					}
				}
			}
			else
			{
				for (var k = index; k >= 0; k--)
				{
					if (matrix[i][k][1] == -1)
					{
						randomizeSuit(matrix, k, i, j);
						matrix[i][k][1] = j;
						j++;
						break;
					}
				}
			}
			
			passedValue = false;
			for (var k = 0; k < 13; k++)
			{
				if (matrix[i][k][1] == -1)
				{
					passedValue = true;
					break;
				}
			}
		}
	}
	return matrix;
}
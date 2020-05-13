from flask import Flask, render_template, request, redirect, Response, jsonify
from functions_library import fetch_data # User defined consolidated library file. 

app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
def initialize():
	'''
		This is the main driver function. We're using it to call any other preprocessing steps 
		or calling any other modules.
		This module also renders the original HTML page. 
	'''
	draw_circular_biplot("CONSOLIDATED")
	return render_template("index.html")


@app.route("/drawCircularBiPlot/<type_to_display>", methods=['POST', 'GET'])
def draw_circular_biplot(type_to_display):
	'''
	This module receives input from the Ajax driver function (myscript.js) and is used to draw
	the Circular BiPlot Graph to plot revenue vs budget for consolidated genre-specific data 
	and revenue vs budget for various movies in the genre.
	It calls the Python method fetch_data with arguments circular_biplot and type_to_display 
	to retrieve relevant data. 

	Input: 
		type_to_display - A string keyword that is used to specify what kind of data is to be 
		displayed in the graph. 
		Values could be 'CONSOLIDATED' or the name of the genre. 
	
	Output: 
		If 'type_to_display' is CONSOLIDATED, we send the aggregated budget/revenue across all
		available genres.
		If 'type_to_display' is the name of the genre, we send the [1-10, 45-55, 90-100] ranged 
		values in revenue/budget sorted list. 
	'''

	data = fetch_data("circular_biplot", type_to_display)
	return data.to_json(orient='records')

if __name__ == "__main__": 
	app.run(debug=True)
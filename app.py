from flask import Flask, render_template, request, redirect, Response, jsonify
from functions_library import driver_fetch_data, initialize_global_vars # User defined consolidated library file. 
import json

app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
def initialize():
	'''
		This is the main driver function. We're using it to call any other preprocessing steps 
		or calling any other modules.
		This module also renders the original HTML page. 
	'''
	
	# We do not need to return anything from initialize_global_vars() function as we use it 
	# only to call preprocess and other necessary functions
	# This is only to make sure that all global var data is captured before any other functions are called
	# And that's only possible if there's something to return, otherwise we're directly going to go to the next line.

	stopTimer = initialize_global_vars() 
	return render_template("index.html")


@app.route("/drawCircularBiPlot/<type_to_display>", methods=['POST', 'GET'])
def draw_circular_biplot(type_to_display):
	'''
	This module receives input from the Ajax driver function (myscript.js) and is used to draw
	the Circular BiPlot Graph to plot revenue vs budget for consolidated genre-specific data 
	and revenue vs budget for various movies in the genre.
	It calls the Python method driver_fetch_data with arguments circular_biplot and type_to_display 
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

	data = driver_fetch_data("circular_biplot", type_to_display)
	return json.dumps(data)


@app.route("/drawRadarChart/<type_to_display>", methods=['POST', 'GET'])
def draw_radar_chart(type_to_display):
	'''
	This module receives input from the Ajax driver function (myscript.js) and is used to draw
	the Radar Chart to plot all numeric components for consolidated genre-specific data 
	and for various movies in the genre.
	It calls the Python method driver_fetch_data with arguments radar_plot and type_to_display 
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

	data = driver_fetch_data("radar_plot", type_to_display)
	return json.dumps(data)


if __name__ == "__main__":
	app.run(debug=True)
	
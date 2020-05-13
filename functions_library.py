import pandas as pd
import numpy as np
import json
import preprocess 


def fetchCircularBiPlotData(chart_type, type_to_display):
	data = pd.read_csv("movie_data.csv")
	
	print("We're in func lib and seeing")
	print(ALL_GENRES)
	
	if type_to_display == 'CONSOLIDATED': 
		
		GENRE_BUDGETS = []
		GENRE_REVENUES = []

		for genre in ALL_GENRES:
			movies_in_genre = GENRE_MOVIE_MAPPER[genre] # This list stores all the movies for the particular genre

			for movie in movies_in_genre: 
				movie_details = MOVIE_DETAILS_MAPPER[movie]
				budget = movie_details[budget]
				revenue = movie_details[revenue]
				'''WORKING'''

	return data


def driver_fetch_data(chart_type, type_to_display):
	'''
	This method is the driver function to fetch data for any specific chart type for any data. 
	
	Input:
		chart_type:
			A string keyword which mentions the type of chart to be displayed and therefore allows us to know 
			which method to call to retrieve appropriate data.
		type_to_display: 
			type_to_display - A string keyword that is used to specify what kind of data is to be 
			displayed in the graph. 
			Values could be 'CONSOLIDATED' or the name of the genre.
	Output:
		If 'type_to_display' is CONSOLIDATED, we send the aggregated budget/revenue across all
		available genres.
		If 'type_to_display' is the name of the genre, we send the [1-10, 45-55, 90-100] ranged 
		values in revenue/budget sorted list. 
	''' 
	method_mapper_dict = {"circular_biplot": "fetchCircularBiPlotData(chart_type, type_to_display)", "scatterplot": "fetchScatterPlotData(chart_type, type_to_display)",
							"barplot": "fetchBarPlotData(chart_type, type_to_display)"}

	method_name = method_mapper_dict[chart_type] # chart_Type = circ bi pplot the nmethod_name will be fetchCircular
	result = eval(method_name)

	return result;


def initialize_global_vars():

	global ALL_GENRES 
	global GENRE_MOVIE_MAPPER
	global MOVIE_DETAILS_MAPPER

	preprocess.preprocess_data()

	ALL_GENRES = preprocess.ALL_GENRES
	GENRE_MOVIE_MAPPER = preprocess.GENRE_MOVIE_MAPPER
	MOVIE_DETAILS_MAPPER = preprocess.MOVIE_DETAILS_MAPPER

	global BUDGETS
	global REVENUES 

	BUDGETS = {}
	REVENUES = {}

	for genre in ALL_GENRES:
		BUDGETS[genre] = 0
		REVENUES[genre] = 0

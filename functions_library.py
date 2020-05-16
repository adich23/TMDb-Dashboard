import pandas as pd
import numpy as np
import json
import preprocess 


def fetchCircularBiPlotData(type_to_display):
	'''
	This function is used to fetch the data to build a Circular BiPlot and is called from app.py
	Input:
		type_to_display: 
			type_to_display - A string keyword that is used to specify what kind of data is to be 
			displayed in the graph. 
			Values could be 'CONSOLIDATED' or the name of the genre.
	'''
	if type_to_display == 'CONSOLIDATED': 

		plot_data = [] 

		for genre in ALL_GENRES:

			movies_in_genre = list(GENRE_MOVIE_MAPPER[genre]) # This list stores all the movies for the particular genre
			
			genre_budget = 0 
			genre_revenue = 0

			for movie in movies_in_genre: 
				movie_details = MOVIE_DETAILS_MAPPER[movie]
				budget = movie_details["budget"]
				revenue = movie_details["revenue"]

				genre_budget += budget
				genre_revenue += revenue

			GENRE_BUDGETS[genre]  = int(genre_budget / 1000000) # Dividing values by a million
			GENRE_REVENUES[genre] = int(genre_revenue / 1000000) # Dividing values by a million

			AVG_GENRE_BUDGETS[genre]  = int(genre_budget / 1000000) /len(movies_in_genre) # Dividing values by a million 
			AVG_GENRE_REVENUES[genre] = int(genre_revenue / 1000000) /len(movies_in_genre) # Dividing values by a million

			genre_details_dict = {}
			genre_details_dict["genre"]   = genre
			genre_details_dict["budget"]  = int(genre_budget / 1000000) # Dividing values by a million
			genre_details_dict["revenue"] = int(genre_revenue / 1000000) # Dividing values by a million
			genre_details_dict["avg_genre_budget"] = int((genre_budget / 1000000) /len(movies_in_genre)) # Dividing values by a million
			genre_details_dict["avg_genre_revenue"] = int((genre_revenue / 1000000) /len(movies_in_genre)) # Dividing values by a million
			plot_data.append(genre_details_dict)
		return plot_data		

	else:
		'''
		This section is executed when the User clicks on a separate genre and we need to provide genre-specific information to the User. 
		The current iteration takes the minimum of 30 or total_movies in the genre sorted by revenue/budget ratio and returns the information to the User
		'''
		plot_data = []
		genre = type_to_display
		
		movies_in_genre = list(GENRE_MOVIE_MAPPER[genre]) # Fetching all the movies in the genre
		num_movies = min(len(movies_in_genre), 30) # Taking the minimum of total movies in the genre and 30 because some genres have less than 30 movies in them.	

		# Sorting movies by revenue/budget ratio in the genre
		movie_details_sorter = [] # List that maintains movie_title and revenue_budget ratio of it so that we can sort on it. Movie details are added as elements in it.
		
		for movie in movies_in_genre:
			movie_details= MOVIE_DETAILS_MAPPER[movie]
			movie_revenue_budget_ratio = movie_details["revenue_budget_ratio"]
			movie_budget = movie_details["budget"]
			movie_revenue = movie_details["revenue"]

			movie_details_sorter.append((movie, movie_budget, movie_revenue, movie_revenue_budget_ratio))
		
		movie_details_sorter.sort(key = lambda x: x[3], reverse=True)
		# Done sorting movies by revenue/budget ratio in the genre
		
		for movie_index in range(num_movies):
			movie_details_dict = {}
			movie_details = movie_details_sorter[movie_index]

			# Adding only the movie_name, movie_revenue and movie_budget as we don't need the ratio
			movie_details_dict["movie"]    = movie_details[0]
			movie_details_dict["budget"]   = int(movie_details[1]/1000000)
			movie_details_dict["revenue"]  = int(movie_details[2]/1000000)
			
			plot_data.append(movie_details_dict)

		return plot_data


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
	method_mapper_dict = {"circular_biplot": "fetchCircularBiPlotData(type_to_display)", "scatterplot": "fetchScatterPlotData(type_to_display)",
							"barplot": "fetchBarPlotData(type_to_display)"}

	method_name = method_mapper_dict[chart_type] 
	
	result = eval(method_name)
	return result;


def initialize_global_vars():
	'''
	This method is used to initialize all the Global variables for the functions_library.py module. 
	These Global variables used across this module are fetched from preprocess.py function and used here. 
	This is just used as an initializer and is called in the initialize() method at app.py
	The line "return True" is simply added to make sure that all the Global variables are calculated and only then
	the next line in app.py initilize() method is executed. 
	'''

	print("Currently initializing global variables")
	
	global ALL_GENRES 
	global GENRE_MOVIE_MAPPER
	global MOVIE_DETAILS_MAPPER

	preprocess.preprocess_data()

	ALL_GENRES = preprocess.ALL_GENRES
	GENRE_MOVIE_MAPPER = preprocess.GENRE_MOVIE_MAPPER
	MOVIE_DETAILS_MAPPER = preprocess.MOVIE_DETAILS_MAPPER

	global GENRE_BUDGETS
	global GENRE_REVENUES 
	global AVG_GENRE_BUDGETS
	global AVG_GENRE_REVENUES 

	GENRE_BUDGETS = {}
	GENRE_REVENUES = {}
	AVG_GENRE_BUDGETS = {}
	AVG_GENRE_REVENUES = {}


	for genre in ALL_GENRES:
		GENRE_BUDGETS[genre] = 0
		GENRE_REVENUES[genre] = 0
		AVG_GENRE_BUDGETS[genre] = 0
		AVG_GENRE_REVENUES[genre] = 0

	print("Done with initializing global variables")

	return True

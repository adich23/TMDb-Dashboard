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
	
	plot_data = []

	if type_to_display == 'CONSOLIDATED': 

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

			GENRE_BUDGETS[genre]  = int(genre_budget / 1e6) # Dividing values by a million
			GENRE_REVENUES[genre] = int(genre_revenue / 1e6) # Dividing values by a million

			AVG_GENRE_BUDGETS[genre]  = int(genre_budget / 1e6) /len(movies_in_genre) # Dividing values by a million 
			AVG_GENRE_REVENUES[genre] = int(genre_revenue / 1e6) /len(movies_in_genre) # Dividing values by a million

			genre_details_dict = {}
			genre_details_dict["genre"]   = genre
			genre_details_dict["budget"]  = int(genre_budget / 1e6) # Dividing values by a million
			genre_details_dict["revenue"] = int(genre_revenue / 1e6) # Dividing values by a million
			genre_details_dict["avg_genre_budget"] = int((genre_budget / 1e6) /len(movies_in_genre)) # Dividing values by a million
			genre_details_dict["avg_genre_revenue"] = int((genre_revenue / 1e6) /len(movies_in_genre)) # Dividing values by a million
			plot_data.append(genre_details_dict)
		return plot_data		

	else:
		'''
		This section is executed when the User clicks on a separate genre and we need to provide genre-specific information to the User. 
		The current iteration takes the minimum of 30 or total_movies in the genre sorted by revenue/budget ratio and returns the information to the User
		'''
		genre = type_to_display
		
		movies_in_genre = list(GENRE_MOVIE_MAPPER[genre]) # Fetching all the movies in the genre
		num_movies = min(len(movies_in_genre), 30) # Taking the minimum of total movies in the genre and 30 because some genres have less than 30 movies in them.	

		# Sorting movies by revenue/budget ratio in the genre
		movie_details_sorter = [] # List that maintains movie_title and revenue_budget ratio of it so that we can sort on it. Movie details are added as elements in it.
		
		for movie in movies_in_genre:
			movie_details = MOVIE_DETAILS_MAPPER[movie]
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
			movie_details_dict["budget"]   = int(movie_details[1]/1e6)
			movie_details_dict["revenue"]  = int(movie_details[2]/1e6)
			
			plot_data.append(movie_details_dict)

		return plot_data


def fetchRadarPlotData(type_to_display):
	'''

	'''
	plot_data = pd.DataFrame(columns = ["genre", "budget", "revenue", "popularity", "vote_avg"])
	
	GROUPED_CATEGORY_TAGS = ["cat1", "cat2", "cat3", "cat4"] # Figure out proper names for these categories

	global CONSOLIDATED_RADAR_DATA

	specific_flag = True

	if type_to_display == "CONSOLIDATED":
		
		for genre_index, genre in enumerate(ALL_GENRES):

			movies_in_genre = list(GENRE_MOVIE_MAPPER[genre])
			num_movies_in_genre = len(movies_in_genre)
			num_movies = min(len(movies_in_genre), 30)
			
			total_budget = 0
			total_revenue = 0
			total_popularity = 0
			total_runtime = 0
			total_vote_avg = 0 

			for movie in movies_in_genre:
				movie_details = MOVIE_DETAILS_MAPPER[movie]
				
				total_budget += movie_details["budget"]
				total_revenue += movie_details["revenue"]
				total_popularity += movie_details["popularity"]		
				# total_runtime += movie_details["runtime"]
				total_vote_avg += movie_details["vote_average"]
			
			total_budget /= num_movies_in_genre
			total_revenue /= num_movies_in_genre 
			total_popularity /= num_movies_in_genre  
			total_vote_avg /= num_movies_in_genre 

			genre_details = []
			genre_details.append(genre)
			genre_details.append(total_budget)
			genre_details.append(total_revenue)
			genre_details.append(total_popularity)
			genre_details.append(total_vote_avg)
				 
			plot_data.loc[genre_index] = genre_details

		plot_data.loc[genre_index+1] = ["IGNORE", 0, 0, 0, 0]
		CONSOLIDATED_RADAR_DATA = plot_data


	elif type_to_display in GROUPED_CATEGORY_TAGS:
		
		GENRE_CATEGORY_MAPPER = {
			"cat1": ["Action", "Adventure", "War"],
			"cat2": ["Drama", "Comedy", "Romance"],
			"cat3": ["Science Fiction", "Family", "Fantasy", "Animation", "Music", "Documentary" ],
			"cat4": ["Thriller", "Crime", "Mystery", "Horror", "History"] 
		}

		genres = GENRE_CATEGORY_MAPPER[type_to_display]
		print(genres)

		for genre_index, genre in enumerate(genres):
			
			movies_in_genre = list(GENRE_MOVIE_MAPPER[genre]) # Fetching all the movies in the genre
			num_movies = min(len(movies_in_genre), 30) # Taking the minimum of total movies in the genre and 30 because some genres have less than 30 movies in them.
			num_movies_in_genre = len(movies_in_genre)

			total_budget = 0
			total_revenue = 0
			total_popularity = 0
			total_runtime = 0
			total_vote_avg = 0 

			for movie in movies_in_genre:
				movie_details = MOVIE_DETAILS_MAPPER[movie]
				
				total_budget += movie_details["budget"]
				total_revenue += movie_details["revenue"]
				total_popularity += movie_details["popularity"]		
				total_vote_avg += movie_details["vote_average"]
				#total_runtime += movie_details["runtime"]
			

			genre_details = []
			genre_details.append(genre)
			genre_details.append(total_budget)
			genre_details.append(total_revenue)
			genre_details.append(total_popularity)
			genre_details.append(total_vote_avg)
				 
			plot_data.loc[genre_index] = genre_details
		plot_data.loc[genre_index+1] = ["IGNORE", 0, 0, 0, 0]

	else:
		specific_flag = False
		print("Entered else with tag:", type_to_display)
		genre = type_to_display
		print(genre)
		for genre_index, genre_data in CONSOLIDATED_RADAR_DATA.iterrows():
			print(genre_data)
			print()
			if genre_data["genre"] == genre:
				plot_data.loc[0] = list(genre_data) 
				print("Entered?", genre_data)

	print("plot data is:")
	print(plot_data)

	data = []
	
	if specific_flag:
		from sklearn.preprocessing import MinMaxScaler
		
		scaler = MinMaxScaler()
		
		genres = plot_data["genre"]
		plot_data = plot_data.drop(columns=["genre"])

		plot_data = scaler.fit_transform(plot_data)

		print("PLOT DATA AFTER SCALING!")
		print(plot_data)

		for index in range(len(genres) - 1):
			genre_dict = {}
			genre_dict["name"] = genres[index]

			genre_axes = []

			genre_axes.append({"axis": "budget", "value": plot_data[index][0] * 100})
			genre_axes.append({"axis": "revenue", "value": plot_data[index][1] * 100})
			genre_axes.append({"axis": "popularity", "value": plot_data[index][2] * 100})
			genre_axes.append({"axis": "vote_avg", "value": plot_data[index][3] * 100})
			
			genre_dict["axes"] = genre_axes
			data.append(genre_dict)
	
	else:
		genre_dict = {}
		genre_dict["name"] = type_to_display
		#print(plot_data[0])
		genre_axes = []
		index = 0
		genre_axes.append({"axis": "budget", "value": plot_data["budget"][index] * 100})
		genre_axes.append({"axis": "revenue", "value": plot_data["revenue"][index] * 100})
		genre_axes.append({"axis": "popularity", "value": plot_data["popularity"][index] * 100})
		genre_axes.append({"axis": "vote_avg", "value": plot_data["vote_avg"][index] * 100})
		
		genre_dict["axes"] = genre_axes
		data.append(genre_dict)
	print("What is data?", data)
	return data


def get_rb_ratio(row):
	# print(row)
	# ratio = float(row[3])/int(row[2])
	ratio = row
	if ratio >4:
		return 3
	if ratio >1.5:
		return 2
	else:
		return 1


def fetchScatterPlotData(chart_type, type_to_display):

	data = MOVIES_DF
	if type_to_display.upper() != 'CONSOLIDATED':
		# find movie list on that genre
		# filter data['name'] on that list
		data = data[data.name.isin(GENRE_MOVIE_MAPPER[type_to_display])]

	data['rb_ratio'] = data['revenue'] / data['budget']
	# data['rb_ratio'] = data['rb_ratio'].astype(int)
	data['rb_ratio'] = data['rb_ratio'].apply(get_rb_ratio)

	return data[data['budget'] > 5].head(400)


def fetchBoxPlotData(chart_type, type_to_display):
	
	data = MOVIES_DF
	data['year'] = data['release_date'].apply(lambda x: str(x)[:4])
	if type_to_display.upper() != 'CONSOLIDATED':
		print(type_to_display)
		print(GENRE_MOVIE_MAPPER.keys())
		print(GENRE_MOVIE_MAPPER[type_to_display][:10])
		print("============================")
		data = data[data.name.isin(GENRE_MOVIE_MAPPER[type_to_display])]
	
	year_dict_0 = {}
	year_dict_0['2011'] = list(data[data['year'] == '2011']['popularity'])[:100]
	year_dict_0['2012'] = list(data[data['year'] == '2012']['popularity'])[:100]
	year_dict_0['2013'] = list(data[data['year'] == '2013']['popularity'])[:100]
	year_dict_0['2014'] = list(data[data['year'] == '2014']['popularity'])[:100]
	year_dict_0['2015'] = list(data[data['year'] == '2015']['popularity'])[:100]

	year_dict_1 = {}
	year_dict_1['2011'] = list(data[data['year'] == '2011']['runtime'])[:100]
	year_dict_1['2012'] = list(data[data['year'] == '2012']['runtime'])[:100]
	year_dict_1['2013'] = list(data[data['year'] == '2013']['runtime'])[:100]
	year_dict_1['2014'] = list(data[data['year'] == '2014']['runtime'])[:100]
	year_dict_1['2015'] = list(data[data['year'] == '2015']['runtime'])[:100]

	return [year_dict_0, year_dict_1]


def fetchParallelPlotData(chart_type, type_to_display):
	
	columns = ['name','year','budget','revenue','profit','runtime','popularity']#,'no_production_companies',]
	data = MOVIES_DF[columns]
	

	if type_to_display.upper() != 'CONSOLIDATED':
		data = data[data.name.isin(GENRE_MOVIE_MAPPER[type_to_display])][columns]
		data = data[(data['year'] > '2010') & (data['year'] <= '2015')]
		
	else:
		data = PARALLEL_DF
	
	# sample data on a strategy
	return data.head(100)


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
	method_mapper_dict = {"circular_biplot": "fetchCircularBiPlotData(type_to_display)", "scatterplot": "fetchScatterPlotData(chart_type, type_to_display)",
							"radar_plot": "fetchRadarPlotData(type_to_display)", "boxplot": "fetchBoxPlotData(chart_type, type_to_display)",
							"parallelplot":"fetchParallelPlotData(chart_type, type_to_display)"}

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
	global MOVIES_DF
	global PARALLEL_DF

	preprocess.preprocess_data()

	ALL_GENRES = preprocess.ALL_GENRES
	GENRE_MOVIE_MAPPER = preprocess.GENRE_MOVIE_MAPPER
	MOVIE_DETAILS_MAPPER = preprocess.MOVIE_DETAILS_MAPPER
	MOVIES_DF = preprocess.MOVIES_DF
	PARALLEL_DF = preprocess.PARALLEL_DF

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

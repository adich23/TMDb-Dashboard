import pandas as pd
import numpy as np
import json
import ast # This module is for converting stringified list representation (after reading from csv) into an actual Python list format


def findGenres(data):
    # Gathering a list of different genres available in the data
    all_genres = []
    movie_genres = [] 
    
    for movie_index, movie_data in data.iterrows():
        genres = movie_data["genres"][1:-1].replace("'","").replace(" ","")
#         print(genres)
        for genre in genres.split(','):
                all_genres.append(genre)
            
    all_genres = list(set(all_genres))
    all_genres.remove("")
    return all_genres

def buildGenreMovieMapper(data):
    genreMovieMapper = {}

    for genre in ALL_GENRES:
        genreMovieMapper[genre] = []

    for movie_index, movie_data in data.iterrows():
        genres = movie_data["genres"][1:-1].replace("'","").replace(" ","")
        
        movie_title = movie_data["original_title"]

        for genre in genres.split(','): 
            if genre == "":
                continue
            movie_list = genreMovieMapper[genre]
            movie_list.append(movie_title)
            genreMovieMapper[genre] = movie_list

    return genreMovieMapper


def buildMovieDetailsMapper(data):
	movieDetailsMapper = {}

	for movie_index, movie_data in data.iterrows():
		movie_title = movie_data["original_title"]

		movie_data_dict = {}
        
		movie_data_dict["budget"] = movie_data["budget"]
		movie_data_dict["genres"] = movie_data["genres"]
		movie_data_dict["keywords"] = movie_data["keywords"]
		movie_data_dict["popularity"] = movie_data["popularity"]
		movie_data_dict["production_companies"] = movie_data["production_companies"]
		movie_data_dict["production_countries"] = movie_data["production_countries"]
		movie_data_dict["revenue"] = movie_data["revenue"]
		movie_data_dict["vote_average"] = movie_data["vote_average"]
        
		movieDetailsMapper[movie_title] = movie_data_dict
	
	return movieDetailsMapper


def preprocess_data():
	'''
	This method preprocesses the data and creates global variables for various mapper objects of ours.  
	'''
	data = pd.read_csv("movie_data.csv")
	
	genres_list = []
	keywords_list = []
	production_companies_list = []
	production_countries_list = []

	for movie_index, movie_data in data.iterrows():
		genres_str = movie_data["genres"]
		genres = ast.literal_eval(genres_str)

		production_companies_str = movie_data["production_companies"]
		production_companies = ast.literal_eval(production_companies_str)

		keywords_str = movie_data["keywords"]
		keywords = ast.literal_eval(keywords_str)

		production_countries_str = movie_data["production_countries"]
		production_countries = ast.literal_eval(production_countries_str)

		data.at[movie_index, "genres"] = genres
		data.at[movie_index, "keywords"] = keywords
		data.at[movie_index, "production_countries"] = production_countries
		data.at[movie_index, "production_companies"] = production_companies
	
	global ALL_GENRES
	global GENRE_MOVIE_MAPPER 
	global MOVIE_DETAILS_MAPPER

	ALL_GENRES = findGenres(data)
	GENRE_MOVIE_MAPPER = buildGenreMovieMapper(data)
	MOVIE_DETAILS_MAPPER = buildMovieDetailsMapper(data)
	
	

	
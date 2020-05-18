import pandas as pd
import numpy as np
import json
import math
import ast # This module is for converting stringified list representation (after reading from csv) into an actual Python list format

def findGenres(data):
    # Gathering a list of different genres available in the data
    all_genres = []
    movie_genres = [] 

    for movie_index, movie_data in data.iterrows():
        genres = movie_data["genres"]

        for genre in genres:
        	if genre not in all_genres:
        		all_genres.append(genre)

    return all_genres


def buildGenreMovieMapper(data):
	genreMovieMapper = {}

	for genre in ALL_GENRES:
		genreMovieMapper[genre] = []

	for movie_index, movie_data in data.iterrows():
		genres = movie_data["genres"]

		movie_title = data["original_title"]

		for genre in genres: 
			movie_list = genreMovieMapper[genre]
			movie_list.append(movie_title)
			genreMovieMapper[genre] = movie_list

	return genreMovieMapper


# def findGenres(data):
#     # Gathering a list of different genres available in the data
#     all_genres = []
#     movie_genres = [] 
    
#     for movie_index, movie_data in data.iterrows():
#         genres = movie_data["genres"][1:-1]#.replace("'","").replace(" ","")
#         print(genres)
#         print("============")
#         for genre in genres.split(','):
#                 all_genres.append(genre)
            
#     all_genres = list(set(all_genres))
#     all_genres.remove("")
#     return all_genres

# def buildGenreMovieMapper(data):
# 	genreMovieMapper = {}

# 	for genre in ALL_GENRES:
# 		genreMovieMapper[genre] = []

# 	for movie_index, movie_data in data.iterrows():
# 		genres = movie_data["genres"][1:-1]
# 		#.replace("'","").replace(" ","")
# 		print(genres)
# 		break
# 		movie_title = movie_data["original_title"]

# 		for genre in genres.split(','): 
# 			if genre == "":
# 				continue
# 			movie_list = genreMovieMapper[genre]
# 			movie_list.append(movie_title)
# 			genreMovieMapper[genre] = movie_list

# 	return genreMovieMapper

def buildMoviesDf():
	columns = ['name','budget','revenue','popularity','vote_average','no_genres','no_production_companies',
          'no_keywords','no_production_countries','profit','runtime','release_date']

	data_list = []
	for key,val in MOVIE_DETAILS_MAPPER.items():
		row  = [0]*12
		if val['budget'] <= 0:
			continue
		if math.isnan(val['runtime']):
			continue
		row[0] = key
		row[1] = val['budget']/1000000
		row[2] = val['revenue']/1000000
		row[3] = val['popularity']
		row[4] = val['vote_average']
		row[5] = len(val['genres'])#.split())
		row[6] = len(val['production_companies'])#.split())
		row[7] = len(val['keywords'])#.split())
		row[8] = len(val['production_countries'])#.split())
		row[9] = (val['revenue'] - val['budget'])/1e6
		if row[9] < -50:
			continue
		row[10] = val['runtime']
		row[11] = val['release_date']
		
		data_list.append(row)
	
	data = pd.DataFrame(data_list, columns=columns)
	data['year'] = data['release_date'].apply(lambda x: str(x)[:4])
	return data

def buildParallelDf(data):
	columns = ['budget','revenue','profit','runtime','popularity','no_production_companies']
	parallel_df = pd.DataFrame(columns=['name']+columns)
	i=0

	for genre in ALL_GENRES:
		sum_data = data[data.name.isin(GENRE_MOVIE_MAPPER[genre])][columns]
		sum_column = sum_data.mean(axis=0)
		sum_column = sum_column.astype(int)
		parallel_df.loc[i] = [genre]+list(sum_column)
		i+=1
	
	return parallel_df

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
		movie_data_dict["runtime"] = movie_data["runtime"]
		movie_data_dict["release_date"] = movie_data["release_date"]
        
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
	global MOVIES_DF
	global PARALLEL_DF

	ALL_GENRES = findGenres(data)
	GENRE_MOVIE_MAPPER = buildGenreMovieMapper(data)
	MOVIE_DETAILS_MAPPER = buildMovieDetailsMapper(data)
	MOVIES_DF = buildMoviesDf()
	PARALLEL_DF = buildParallelDf(MOVIES_DF)
	
	

	

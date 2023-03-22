#####################
#
# import library
#
#####################

import csv
import numpy as np
import os
import time

# set parameter

count = 0
rows = list()
color_split_list = list()
header = list()
color_grp_to_find_corr = list()
corr_header_list = list()
corr_data_list = list()
time_start_list = list()
time_end_list = list()
color_list = list()
corr_of_grp_parameter_list = list()

#####################
#
# function
#
#####################

def split_data_by_color() :

    # find color column
    color_col = 0
    for i in range(len(header)) :
        if header[i] == 'Color_on_Path' :
            color_col = i
            break
    
    # split data by color in sublist
    current_color = 'None'
    grp_data_by_color_list = list()

    for i in range(len(rows)) :
        if current_color == 'None' :
            current_color = rows[i][color_col]
            grp_data_by_color_list.append(rows[i])
        
        elif rows[i][color_col] != current_color :
            current_color = rows[i][color_col]
            color_split_list.append(grp_data_by_color_list)
            grp_data_by_color_list = []
            grp_data_by_color_list.append(rows[i])
        
        else :
            grp_data_by_color_list.append(rows[i])
    
    color_split_list.append(grp_data_by_color_list)
        
    # group path that less than 2 second
    skip_list = 1
    count = 0
    data_to_add = list()

    while(1) :
        
        if count >= (len(color_split_list)) :
            break
        
        if len(color_split_list[count]) < 20 :
            color_split_list[count] = color_split_list[count] + color_split_list[count + skip_list]
            skip_list = skip_list + 1

            if count + skip_list >= (len(color_split_list)) :
                data_to_add.append(count)
                count = count + skip_list
                skip_list = 1
                break

        else :
            data_to_add.append(count)
            count = count + skip_list
            skip_list = 1

    for i in data_to_add :
        color_grp_to_find_corr.append(color_split_list[i])    
    
    # print(len(rows))
    # print(color_split_list[1])

def create_csv_for_all_path() :

  # create new CSV with library CSV

  print('Start create all parameter csv')
  start = time.time()

  for i in range(len(color_grp_to_find_corr)) :

    with open('path_collect/path_no_{}.csv'.format(i), 'w') as f:
        
        # using csv.writer method from CSV package
        write = csv.writer(f)

        write.writerow(header)      
        write.writerows(color_grp_to_find_corr[i])
  
  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

def find_corr_for_each_path() :
    
    print('Find data correlation')
    start = time.time()

    eng_consump = 0
    time_us = 0
    path_color = 0
    color = str()
    eng_consump_list = list()
    parameter_to_find_corr_list = list()
    color_phase_list = list()
    corr_list = list()
    
    for i in range(len(color_grp_to_find_corr)) :
        
        # get energy consumption list
        if eng_consump == 0 :
            for j in range(len(header)) :
                if header[j] == 'Volt_x_Curr' :
                    eng_consump = j
                elif header[j] == 'TimeUS' :
                    time_us = j
                elif header[j] == 'Color_on_Path' :
                    path_color = j
        
        # print(eng_consump, time_us, path_color, color_grp_to_find_corr[i][0][20])
        eng_consump_list = list()

        # get time
        time_start_list.append(float(color_grp_to_find_corr[i][0][time_us]))
        time_end_list.append(float(color_grp_to_find_corr[i][len(color_grp_to_find_corr[i]) - 1][time_us]))

        # get energy consumption
        for j in range(len(color_grp_to_find_corr[i])) :
            eng_consump_list.append(float(color_grp_to_find_corr[i][j][eng_consump]))
        
        # got path color

        color = ''
        color_phase_list = list()

        for j in range(len(color_grp_to_find_corr[i])) :
            if color_phase_list == [] :
                color_phase_list.append(str(color_grp_to_find_corr[i][j][path_color]))
            elif str(color_grp_to_find_corr[i][j][path_color]) not in color_phase_list :
                color_phase_list.append(str(color_grp_to_find_corr[i][j][path_color]))
        
        for j in color_phase_list :
            if color == '' :
                color = j
            else :
                color = color + '_' + j
        
        color_list.append(color)

        # find correlation by energy consumption with parameter

        corr_list = list()

        for j in range(len(color_grp_to_find_corr[i][0])) :

            if j == time_us or j == path_color or j == eng_consump :
                continue
            
            parameter_to_find_corr_list = list()

            for k in range(len(color_grp_to_find_corr[i])) :
                parameter_to_find_corr_list.append(float(color_grp_to_find_corr[i][k][j]))
            
            data = np.array([eng_consump_list, parameter_to_find_corr_list])
            # print(len(parameter_to_find_corr_list), len(eng_consump_list))
            correlation = np.corrcoef(data)[0, 1]
            # print(correlation)
            corr_list.append(correlation)
        
        corr_of_grp_parameter_list.append(corr_list)
    
    end = time.time()
    print('Finish in ', round(end - start, 2), ' second')
        
    # print(len(time_start_list), len(time_end_list), len(color_list), len(corr_of_grp_parameter_list))

def create_new_data_row() :

    print('Start create data row')
    start = time.time()    

    # create new header and data for new csv

    data_row_list = list()

    corr_header_list.append('Phase_start')
    corr_header_list.append('Phase_end')
    corr_header_list.append('Path_color')

    for i in header :
        if i == 'Volt_x_Curr' or i == 'TimeUS' or i == 'Color_on_Path' :
            continue
        else :
            corr_header_list.append(i)
    
    for i in range(len(color_grp_to_find_corr)) :
        
        data_row_list = list()
        
        data_row_list.append(time_start_list[i])
        data_row_list.append(time_end_list[i])
        data_row_list.append(color_list[i])

        for j in range(len(corr_of_grp_parameter_list[i])) :
            if np.isnan(corr_of_grp_parameter_list[i][j]) :
                data_row_list.append(0)
            else :
                data_row_list.append(abs(corr_of_grp_parameter_list[i][j]))
    
        corr_data_list.append(data_row_list)

    end = time.time()
    print('Finish in ', round(end - start, 2), ' second')
    
    # print(len(corr_header_list))
    # print(corr_data_list[0])

def delete_all_file_in_dir() :

    directory = 'path_collect'

    for filename in os.listdir(directory) :
        file_path = os.path.join(directory, filename)
        try :
            if os.path.isfile(file_path) :
                os.remove(file_path)
        except OSError :
            print("Error deleting file:", file_path)

#####################
#
# main
#
#####################

file_path = 'data/data_to_web/Complete_data.csv'
file = open(file_path)

csvreader = csv.reader(file)
header = next(csvreader)

count = 0

for row in csvreader :
  rows.append(row)

split_data_by_color()
create_csv_for_all_path()
# find_corr_for_each_path()
# create_new_data_row()

with open('data/data_to_web/Data_corr.csv', 'w') as f:
        
    # using csv.writer method from CSV package
    write = csv.writer(f)
            
    write.writerow(corr_header_list)
    write.writerows(corr_data_list)

# delete_all_file_in_dir()

print('+++++++++++End++++++++++')
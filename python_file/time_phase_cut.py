#####################
#
# import library
#
#####################

import csv
import numpy as np
import time

count = 0
rows = list()
corr_list = list()
time_phase_row = list()
color_split_list = list()
header = list()
corr_header_list = list()
corr_data_list = list()
corr_list_to_web = list()

#####################
#
# function
#
#####################

def select_data_from_time() :

    # fine tine start and time end
    time_start = rows[0][0]
    time_end = rows[-1][0]
    start_pos = 0
    end_pos = -1

    # get time from website and change time_start and time_end
    # time_start = time_from_web_start
    # time_end = time_from_web_end

    for i in range(len(rows)) :
        if rows[i][0] == time_start :
            start_pos = i
        if rows[i][0] == time_end :
            end_pos = i
    
    # get data from time phase
    for i in range(start_pos, end_pos) :
        time_phase_row.append(rows[i])
    
    corr_list_to_web.append(time_start)
    corr_list_to_web.append(time_end)
    
    # print(time_start, time_end, start_pos, end_pos)

def find_corr_for_path() :
    
    print('Find data correlation')
    start = time.time()

    eng_consump = 0
    time_us = 0
    eng_consump_list = list()
    parameter_to_find_corr_list = list()

    # get energy consumption list
    if eng_consump == 0 :
        for j in range(len(header)) :
            if header[j] == 'Volt_x_Curr' :
                eng_consump = j
            elif header[j] == 'TimeUS' :
                time_us = j
        
    # print(eng_consump, time_us, path_color, time_phase_row[i][0][20])
    eng_consump_list = list()

    # get energy consumption
    for j in range(len(time_phase_row)) :
        eng_consump_list.append(float(time_phase_row[j][eng_consump]))

    # find correlation by energy consumption with parameter
    for j in range(len(time_phase_row[0])) :

        if j == time_us or j == eng_consump :
            continue
            
        parameter_to_find_corr_list = list()

        for k in range(len(time_phase_row)) :
            parameter_to_find_corr_list.append(float(time_phase_row[k][j]))
            
        data = np.array([eng_consump_list, parameter_to_find_corr_list])
        # print(len(parameter_to_find_corr_list), len(eng_consump_list))
        correlation = np.corrcoef(data)[0, 1]
        # print(correlation)
        corr_list.append(correlation)
    
    end = time.time()
    print('Finish in ', round(end - start, 2), ' second')
        
    # print(corr_list)

def create_new_data() :

    print('Start create data')
    start = time.time()    

    # create new header and data for new csv

    data_row_list = list()

    corr_header_list.append('Phase_start')
    corr_header_list.append('Phase_end')

    for i in header :
        if i == 'Volt_x_Curr' or i == 'TimeUS' :
            continue
        else :
            corr_header_list.append(i)
    
    # print(corr_list_to_web)
    
    for i in range(len(corr_list)) :
        
        if abs(corr_list[i]) >= 0.3 :
            corr_list_to_web.append('HIGH')
        elif abs(corr_list[i]) < 0.3 and abs(corr_list[i]) >= 0.1 :
            corr_list_to_web.append('MEDIUM')
        else :
            corr_list_to_web.append('LOW')
    
    # print(corr_list_to_web)

    end = time.time()
    print('Finish in ', round(end - start, 2), ' second')

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

select_data_from_time()
find_corr_for_path()
create_new_data()

with open('data/data_to_web/Data_corr.csv', 'w') as f:
        
    # using csv.writer method from CSV package
    write = csv.writer(f)
            
    write.writerow(corr_header_list)
    write.writerow(corr_list_to_web)

# delete_all_file_in_dir()

print('+++++++++++End++++++++++')
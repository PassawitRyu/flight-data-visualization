#####################
#
# import library
#
#####################

import pandas as pd
import csv
import numpy as np
import math
import sys
import os
import matplotlib.pyplot as plt
import seaborn as sns
import time
import shutil

from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.feature_selection import f_regression
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Lasso
from sklearn import metrics

# set parameter

count = 0
rows = list()
parameter_split_dict = dict()
fmt_parameter_dict = dict()
parameter_split_list = list()
parameter_from_sensor_list = list()
parameter_data_list = list()
header_list = list()
all_subheader_list = list()
energy_consumption_time = list()
equal_or_more_than_10_hz_parameter = list()
less_than_10_hz_parameter = list()
less_than_10_hz_order = list()
equal_or_more_than_10_hz_order = list()
m_list = list()
c_list = list()
parameter_same_freq_list = list()
collect_all_parameter_value = list()
collect_all_parameter_name = list()
order_to_conbine = list()
all_data_list = list()
voltcurr_list = list()
color_path = list()
complete_parameter = list()
complete_header = list()

# mission planner 4.0.9 only
used_parameter_list = ['RCOU', 'ATT', 'ARSP', 'BAT', 'BARO', 'TECS', 'CTUN', 'QTUN', 'AOA', 'NKF2', 'GPS']
parameter_show_on_web = ['TimeUS', 'RCOU_C9', 'QTUN_DAlt', 'QTUN_Alt', 'TECS_dh', 'BARO_CRt', 'ARSP_Airspeed', 'CTUN_NavPitch', 'ATT_DesRoll', 'ATT_Roll', 'ATT_Yaw', 'ATT_DesYaw', 'CTUN_RdrOut', 'AOA_AOA', 'AOA_SSA', 'NKF2_VWN', 'NKF2_VWE', 'GPS_Lat', 'GPS_Lng', 'GPS_Alt']

#####################
#
# function
#
#####################

def delete_all_file_in_dir() :

    directory_parameter = './python_file/data/parameter_collect'
    directory_web = './python_file/data/data_to_web'

    for filename in os.listdir(directory_parameter) :
        file_path = os.path.join(directory_parameter, filename)
        try :
            if os.path.isfile(file_path) :
                os.remove(file_path)
        except OSError :
            print("Error deleting file:", file_path)
    
    for filename in os.listdir(directory_web) :
        file_path = os.path.join(directory_web, filename)
        try :
            if os.path.isfile(file_path) :
                os.remove(file_path)
        except OSError :
            print("Error deleting file:", file_path)

def split_data_into_sub_list():

  # split data into sub list

  print('Start split data into sub list')
  start = time.time()

  count = 0

  for i in range(len(rows)):
    name = '{}'.format(rows[i][0])
    if name not in parameter_split_dict:
      parameter_split_dict[name] = count
      count += 1

  for i in range(len(parameter_split_dict)):
    parameter_split_list.append([])

  for i in range(len(rows)):
    parameter_split_list[parameter_split_dict[rows[i][0]]].append(rows[i])
  
  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

  # print(parameter_split_dict)
  # print(len(parameter_split_list))

def collect_parameter() :

  print('Start collect parameter')
  start = time.time()

  for i in parameter_split_dict :
    if i in used_parameter_list :
      parameter_from_sensor_list.append(i)

  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

  # print(parameter_from_sensor_list)
  # print(len(parameter_from_sensor_list))

def create_fmt_csv() :
  
  # create FMT.csv 

  print('Start create fmt')
  start = time.time()

  with open('./python_file/data/parameter_collect/{}.csv'.format(parameter_split_list[0][0][0]), 'w') as f:
        
    # using csv.writer method from CSV package
    write = csv.writer(f)
    write.writerows(parameter_split_list[0])
  
    f.close()

  # get parameter with sub parameter

  parameter_fmt = open('./python_file/data/parameter_collect/FMT.csv')
  fmt_reader = csv.reader(parameter_fmt)

  fmt_rows = list()

  for row in fmt_reader :
    del row[0:3]
    del row[1]
    fmt_rows.append(row)

  # for i in range(len(fmt_rows)) :
  #   print(fmt_rows[i])

  for i in range(len(fmt_rows)) :
    for j in range(2, len(fmt_rows[i])) :
      fmt_rows[i][j] = fmt_rows[i][0] + '_' + fmt_rows[i][j]

  # print(fmt_rows[i])

  # create dict to collect parameter with sub parameter

  for i in range(len(fmt_rows)) :
    fmt_parameter_dict[fmt_rows[i][0].replace("'", "")] = fmt_rows[i]

  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

  # print(fmt_parameter_dict[' FMT'])

def create_parameter_csv() :

  # create new CSV with library CSV

  print('Start create all parameter csv')
  start = time.time()

  for i in range(1, len(parameter_split_list)) :

    with open('./python_file/data/parameter_collect/{}.csv'.format(parameter_split_list[i][0][0]), 'w') as f:
        
      # using csv.writer method from CSV package
      write = csv.writer(f)

      write.writerow(fmt_parameter_dict[" " + parameter_split_list[i][0][0]])      
      write.writerows(parameter_split_list[i])

      f.close()
  
  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

def get_battery_time() :

  file = open('./python_file/data/parameter_collect/BAT.csv')

  csvreader = csv.reader(file)
  next(csvreader)

  for row in csvreader :
    energy_consumption_time.append(float(row[1]))

def separate_parameter_frequency() :

  time_diff = energy_consumption_time[1] - energy_consumption_time[0]

  for i in range(len(parameter_data_list)) :

    # print('{} has time diff {}'.format(parameter_data_list[i][0][0], float(parameter_data_list[i][2][1]) - float(parameter_data_list[i][1][1])))

    if float(parameter_data_list[i][2][1]) - float(parameter_data_list[i][1][1]) > time_diff + 0.02 and float(parameter_data_list[i][2][1]) - float(parameter_data_list[i][1][1]) > time_diff - 0.02 :
      less_than_10_hz_parameter.append(parameter_data_list[i][0][0])
    else :
      equal_or_more_than_10_hz_parameter.append(parameter_data_list[i][0][0])

  # print(less_than_10_hz_parameter)
  # print(equal_or_more_than_10_hz_parameter)

def find_parameter_order() :

  # find order in each parameter

  lt_count = 0
  eom_count = 0

  for i in range(len(parameter_data_list)) :
    if lt_count < len(less_than_10_hz_parameter) and parameter_data_list[i][0][0] == less_than_10_hz_parameter[lt_count] :
      less_than_10_hz_order.append(i)
      lt_count += 1
    elif parameter_data_list[i][0][0] == equal_or_more_than_10_hz_parameter[eom_count] and eom_count < len(equal_or_more_than_10_hz_parameter) :
      equal_or_more_than_10_hz_order.append(i)
      eom_count += 1

  # print(less_than_10_hz_order)
  # print(equal_or_more_than_10_hz_order)

def if_freq_less() :

  print('Start selecting data')
  start = time.time()

  # select data that in same time of energy consumption

  for k in less_than_10_hz_order :
    new_parameter = list()
    time_count = 1

    # print(energy_consumption_time[-1], float(parameter_data_list[k][-1][1]))

    for i in range(len(energy_consumption_time)) :
      parameter_dataset = list()
      parameter_dataset.append(energy_consumption_time[i])

      if energy_consumption_time[i] > float(parameter_data_list[k][-1][1]) :
        for j in range(2, len(parameter_data_list[k][0])) :
          gen_new_data = 0
          parameter_dataset.append(gen_new_data)      

      else :
        for l in range(time_count, len(parameter_data_list[k])) :
          if time_count + 1 >= len(parameter_data_list[k]) :
            time_count = len(parameter_data_list[k]) - 1
            for j in range(2, len(parameter_data_list[k][0])) :
              gen_new_data = parameter_data_list[k][time_count][j]
              parameter_dataset.append(gen_new_data)
            break

          elif abs(energy_consumption_time[i] - float(parameter_data_list[k][time_count][1])) < abs(energy_consumption_time[i] - float(parameter_data_list[k][time_count + 1][1])) :
            for j in range(2, len(parameter_data_list[k][0])) :
              gen_new_data = parameter_data_list[k][time_count][j]
              parameter_dataset.append(gen_new_data)
            break           

          time_count = l

        if parameter_dataset == [] :
          print(1)
      new_parameter.append(parameter_dataset[1:])

    parameter_same_freq_list.append(new_parameter)

  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

def if_freq_equal_or_more() :
  
  # create m in linier equation
  # from y = mx + c
  # m = delta y / delta x
  # solving c

  print('Start sampling data')
  start = time.time()

  for k in equal_or_more_than_10_hz_order :
    # create list to collect all m and c for sub parameter
    sub_m_list = list()
    sub_c_list = list()

    # loop in each parameter from sensor
    for i in range(1, len(parameter_data_list[k]) - 1) :
      
      # append list to collect m and c in each timestamp
      sub_m_list.append([])
      sub_c_list.append([])

      for j in range(2, len(parameter_data_list[k][i])) :

        m = abs(float(parameter_data_list[k][i + 1][j]) - float(parameter_data_list[k][i][j])) / (float(parameter_data_list[k][i + 1][1]) - float(parameter_data_list[k][i][1]))
        sub_m_list[i - 1].append(m)
        c = float(parameter_data_list[k][i + 1][j]) - (m * float(parameter_data_list[k][i + 1][1]))
        sub_c_list[i - 1].append(c)

    m_list.append(sub_m_list)
    c_list.append(sub_c_list) 

  # print(len(m_list[1]))

  # generate data to small frequency (BAT)

  count = 0

  for k in equal_or_more_than_10_hz_order :
    # print(count)
    new_parameter = []
    m_condition = 0
    c_condition = 0
    time_count = 1

    # in BAT parameter time 
    for i in range(len(energy_consumption_time)) :
      # print(1)
      parameter_dataset = []
      parameter_dataset.append(energy_consumption_time[i])

      # condition if time more than value in parameter that sensor has correct
      if time_count >= len(parameter_data_list[k]) :
        # print('BAT time {} and Parameter time {} in condition 1'.format(energy_consumption_time[i], parameter_data_list[k][time_count][1]))
        time_count = len(parameter_data_list[k]) - 1
        for j in range(len(m_list[count][0])) :
          gen_new_data = parameter_data_list[k][time_count][j + 2]
          parameter_dataset.append(gen_new_data)

      # condition if already have data from sensor , then add it in new list   
      elif(float(parameter_data_list[k][time_count][1]) < float(energy_consumption_time[i])) :
        # print('BAT time {} and Parameter time {} in condition 2'.format(energy_consumption_time[i], parameter_data_list[k][time_count][1]))
        for j in range(len(m_list[count][0])) :
          gen_new_data = parameter_data_list[k][time_count][j + 2]
          parameter_dataset.append(gen_new_data)

        time_count += 1
        m_condition += 1
        c_condition += 1
        if m_condition >= len(m_list[count][0]) or c_condition >= len(c_list[count][0]) :
          m_condition = len(m_list[count][0]) - 1
          c_condition = len(c_list[count][0]) - 1

      else :
        # print('BAT time {} and Parameter time {} in condition 3'.format(energy_consumption_time[i], parameter_data_list[k][time_count][1]))
        # print(m_condition)
        for j in range(len(m_list[count][0])) :
          # gen_new_data = m_list[count][m_condition][j]
          gen_new_data = (m_list[count][m_condition][j] * float(energy_consumption_time[i])) + c_list[count][c_condition][j]

          parameter_dataset.append(gen_new_data)
        
      new_parameter.append(parameter_dataset[1:])
    
    count += 1
    parameter_same_freq_list.append(new_parameter)
  
  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

  # print(parameter_same_freq_list[0][0:10])

def collect_all_parameter() :

  for i in equal_or_more_than_10_hz_parameter :
    collect_all_parameter_name.append(i)
  for i in less_than_10_hz_parameter :
    collect_all_parameter_name.append(i)

  for i in collect_all_parameter_name :
    for j in range(len(used_parameter_list)) :
      if i == used_parameter_list[j] :
        order_to_conbine.append(j)

  # print(collect_all_parameter_name)
  # print(used_parameter_list)
  # print(order_to_conbine)

def combine_all_parameter() :

  print('Start combine data')
  start = time.time()

  global all_data_list

  for i in range(len(energy_consumption_time)) :
    all_data_list.append([energy_consumption_time[i]])

  all_data_list = np.array(all_data_list)

  for i in order_to_conbine :
    second_parameter_list = parameter_same_freq_list[i]
    second_parameter_list = np.array(second_parameter_list)
    all_data_list = np.concatenate((all_data_list, second_parameter_list), axis = 1)

  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

def add_bat_volt_x_curr() :
  
  # find volt and current

  find_volt_curr = [0, 0]
  volt_list = list()
  curr_list = list()

  for i in range(len(all_subheader_list)) :
    if all_subheader_list[i] == 'BAT_Volt' :
      find_volt_curr[0] = i
    elif all_subheader_list[i] == 'BAT_Curr' :
      find_volt_curr[1] = i

  for i in range(len(all_data_list)) :
    volt_list.append(all_data_list[i][find_volt_curr[0]])
    curr_list.append(all_data_list[i][find_volt_curr[1]])

  # create volt * curr and diff enrgtot

  for i in range(len(all_data_list)) : 
    vocu_multiple = float(volt_list[i]) * float(curr_list[i])
    voltcurr_list.append(vocu_multiple)

  # print(voltcurr_list)

def color_of_energy_consumption() :

  get_min = np.min(voltcurr_list)
  get_max = np.max(voltcurr_list)

  for data in voltcurr_list :
    color_code = (data - get_min) / (get_max - get_min)
    color_code = color_code * 100
    color_path.append(int(color_code))
  
  print('min is {} and max is {}'.format(get_min, get_max))

def select_parameter_to_show_on_web() :

  print('Start complete data')
  start = time.time()

  # get order of each parameter
  global complete_parameter
  global complete_header
  complete_header = parameter_show_on_web
  parameter_show_on_web_order = list()
  collect_data_to_concatenate = list()
  np_voltcurr_list = list()
  np_color_path = list()

  for parameter in parameter_show_on_web :
    for i in range(len(all_subheader_list)) :
      if parameter == all_subheader_list[i] :
        parameter_show_on_web_order.append(i)
        break

  # print(parameter_show_on_web_order)

  time_us = parameter_show_on_web_order[0]

  for i in range(len(all_data_list)) :
    complete_parameter.append([all_data_list[i][time_us]])

  complete_parameter = np.array(complete_parameter)

  for i in range(1, len(parameter_show_on_web_order)) :
    collect_data_to_concatenate = []
    for j in range(len(all_data_list)) :
      collect_data_to_concatenate.append([all_data_list[j][parameter_show_on_web_order[i]]])
    second_parameter_list = np.array(collect_data_to_concatenate)
    complete_parameter = np.concatenate((complete_parameter, second_parameter_list), axis = 1)

  complete_header.append('Volt_x_Curr')
  complete_header.append('Color_on_Path')

  for i in range(len(all_data_list)) :
    np_voltcurr_list.append([voltcurr_list[i]])
    np_color_path.append([color_path[i]])

  np_voltcurr_list = np.array(np_voltcurr_list)
  np_color_path = np.array(np_color_path)

  complete_parameter = np.concatenate((complete_parameter, np_voltcurr_list, np_color_path), axis = 1)

  end = time.time()
  print('Finish in ', round(end - start, 2), ' second')

#####################
#
# main
#
#####################

delete_all_file_in_dir()

file_path = f'./python_file/data/upload_file/{sys.argv[1]}.csv'
file = open(file_path)

csvreader = csv.reader(file)

count = 0

for row in csvreader :
  row[1] = float(row[1]) / 1000000
  rows.append(row)
  count += 1

split_data_into_sub_list()
collect_parameter()
create_fmt_csv()
create_parameter_csv()

# get all parameter csv that used

parameter_array = used_parameter_list

for i in range(len(parameter_array)) :
  file = open('./python_file/data/parameter_collect/{}.csv'.format(parameter_array[i]))

  csvreader = csv.reader(file)
  header = next(csvreader)
  header_list.append(header)

  rows = list()

  for row in csvreader :
    rows.append(row)

  parameter_data_list.append(rows)

# print(len(parameter_data_list))

# combine all header

all_subheader_list.append('TimeUS')

for i in range(len(header_list)) :
  for j in range(2, len(header_list[i])) :
    all_subheader_list.append(header_list[i][j].strip().replace(" ", ""))

# get battery time

get_battery_time()
separate_parameter_frequency()
find_parameter_order()
if_freq_equal_or_more()
if_freq_less()

for i in range(len(parameter_same_freq_list)) :
  for j in range(len(parameter_same_freq_list[i])) :
    if len(parameter_same_freq_list[i][j]) == 0 :
      for k in range(len(parameter_same_freq_list[i][0])) :
        parameter_same_freq_list[i][j].append(parameter_same_freq_list[i][j - 1][k])

collect_all_parameter()
combine_all_parameter()
add_bat_volt_x_curr()
color_of_energy_consumption()
select_parameter_to_show_on_web()

with open(f'./python_file/data/data_to_web/{sys.argv[1]}.csv', 'w') as f:
      
  # using csv.writer method from CSV package
  write = csv.writer(f)
      
  write.writerow(complete_header)
  write.writerows(complete_parameter)

  f.close()

print('+++++++++++End++++++++++')

sys.exit()


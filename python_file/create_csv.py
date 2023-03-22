import csv
import os
print(os.getcwd())
complete_header = ['a','b','c']
complete_parameter = [[1,2,3],[4,5,6]]

with open('./python_file/data/data_to_web/meow.csv', 'w') as f:
      
  # using csv.writer method from CSV package
  write = csv.writer(f)
      
  write.writerow(complete_header)
  write.writerows(complete_parameter)

print('+++++++++++End++++++++++')
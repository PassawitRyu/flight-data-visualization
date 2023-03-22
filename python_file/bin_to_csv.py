import struct
import csv

# Define the format of each record in the binary file
# using format specifiers from the struct module
record_format = 'iiii'
record_size = struct.calcsize(record_format)

# Open the binary file for reading in binary mode
with open('binary_file.bin', 'rb') as binary_file:
    # Open the CSV file for writing
    with open('csv_file.csv', 'w', newline='') as csv_file:
        # Create a CSV writer
        writer = csv.writer(csv_file)

        # Write the header row to the CSV file
        writer.writerow(['col1', 'col2', 'col3', 'col4'])

        # Read the binary file record by record
        while True:
            # Read one record from the binary file
            record = binary_file.read(record_size)

            # If there are no more records, break out of the loop
            if not record:
                break

            # Unpack the record into separate values
            col1, col2, col3, col4 = struct.unpack(record_format, record)

            # Write the extracted values to the CSV file
            writer.writerow([col1, col2, col3, col4])
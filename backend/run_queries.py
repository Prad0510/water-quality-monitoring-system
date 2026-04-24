from lxml import etree
import os

# Load and parse the XML file
file_path = 'water_quality.xml'
if not os.path.exists(file_path):
    print(f"Error: {file_path} not found!")
else:
    tree = etree.parse(file_path)

    # Define 5 different types of XPath/XQuery style tests
    tasks = [
        ("1. Simple Path (Retrieve all Locations)", "/WaterMonitoringSystem/Station/Location/text()"),
        ("2. Attribute Selection (Retrieve all Station IDs)", "//Station/@id"),
        ("3. Predicate Filter (Retrieve courses/stations by Technician)", "//Station[Technician='Dr. Sarah Chen']/Location/text()"),
        ("4. Relational/Numeric (Find pH > 7.0)", "//Station[Metrics/pH > 7.0]/Location/text()"),
        ("5. Attribute Filter (Find Stations by Date)", "//Station[Schedule/@date='2026-04-10']/Location/text()")
    ]

    print("=== WATER QUALITY MONITORING SYSTEM: QUERY OUTPUTS ===\n")
    for title, query in tasks:
        print(f"TASK: {title}")
        print(f"QUERY: {query}")
        results = tree.xpath(query)
        print(f"RESULTS: {results}")
        print("-" * 50)
    print("\n=== FORMATTED WATER QUALITY CATALOGUE ===")
print(f"{'ID':<10} | {'LOCATION':<25} | {'TECHNICIAN':<20} | {'STATUS':<10}")
print("-" * 75)

stations = tree.xpath("//Station")
for s in stations:
    s_id = s.xpath("@id")[0]
    loc = s.xpath("Location/text()")[0]
    tech = s.xpath("Technician/text()")[0]
    stat = s.xpath("Metrics/Status/text()")[0]
    print(f"{s_id:<10} | {loc:<25} | {tech:<20} | {stat:<10}")
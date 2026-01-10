#!/usr/bin/env python3
"""
Script to analyze the Excel Binary file (.xlsb) - quick structure analysis.
"""

from pyxlsb import open_workbook
import json

def get_column_letter(col_idx):
    """Convert column index (0-based) to Excel column letter."""
    result = ""
    while col_idx >= 0:
        result = chr(col_idx % 26 + ord('A')) + result
        col_idx = col_idx // 26 - 1
    return result

def analyze_xlsb_quick(file_path):
    """Quick analyze an xlsb file - just headers and structure."""
    
    analysis = {
        "sheets": [],
        "summary": {}
    }
    
    with open_workbook(file_path) as wb:
        sheet_names = wb.sheets
        analysis["summary"]["total_sheets"] = len(sheet_names)
        analysis["summary"]["sheet_names"] = sheet_names
        
        print(f"=" * 80)
        print(f"Excel File Analysis: {file_path}")
        print(f"=" * 80)
        print(f"\nTotal Sheets: {len(sheet_names)}")
        print(f"Sheet Names: {', '.join(sheet_names)}")
        
        for sheet_name in sheet_names:
            print(f"\n{'=' * 80}")
            print(f"Sheet: {sheet_name}")
            print(f"{'=' * 80}")
            
            sheet_data = {
                "name": sheet_name,
                "headers": [],
                "sample_data": [],
                "row_count": 0
            }
            
            with wb.get_sheet(sheet_name) as sheet:
                rows_seen = 0
                header_row = None
                sample_rows = []
                
                for row_idx, row in enumerate(sheet.rows()):
                    rows_seen = row_idx + 1
                    
                    # Only process first 20 rows for speed
                    if row_idx < 20:
                        row_values = []
                        for cell in row:
                            row_values.append(cell.v if cell.v is not None else "")
                        
                        # Try to find the header row (usually contains string labels)
                        has_strings = any(isinstance(v, str) and v.strip() for v in row_values)
                        if has_strings and header_row is None:
                            header_row = row_values
                            sheet_data["header_row_index"] = row_idx + 1
                            continue
                        
                        if header_row and row_idx < 15:
                            sample_rows.append(row_values)
                    
                    # Skip the rest for speed - just count
                    if rows_seen >= 100:
                        # Count remaining rows quickly
                        for _ in sheet.rows():
                            rows_seen += 1
                        break
                
                sheet_data["row_count"] = rows_seen
                sheet_data["headers"] = header_row or []
                sheet_data["sample_data"] = sample_rows[:5]
                
                print(f"\n  Approx Row Count: {rows_seen}")
                
                if header_row:
                    print(f"\n  --- Headers (Row {sheet_data.get('header_row_index', 'N/A')}) ---")
                    for i, h in enumerate(header_row):
                        if h:
                            print(f"    {get_column_letter(i)}: {h}")
                
                if sample_rows:
                    print(f"\n  --- Sample Data ---")
                    for i, row in enumerate(sample_rows[:3]):
                        row_str = " | ".join([str(v)[:25] if v else "" for v in row[:12]])
                        print(f"    Row: {row_str}")
            
            analysis["sheets"].append(sheet_data)
    
    return analysis

if __name__ == "__main__":
    file_path = "/Users/gauravrai/projects/VehicleTracker/vehicle-tracking/public/Pradeep@2025.xlsb"
    analysis = analyze_xlsb_quick(file_path)
    
    # Save to JSON
    with open("/Users/gauravrai/projects/VehicleTracker/vehicle-tracking/excel_structure.json", "w") as f:
        json.dump(analysis, f, indent=2, default=str)
    
    print(f"\n\n{'=' * 80}")
    print("Quick analysis complete! Structure saved to excel_structure.json")
    print(f"{'=' * 80}")

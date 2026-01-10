#!/usr/bin/env python3
"""
Script to analyze the Excel Binary file (.xlsb) and extract formulas and data.
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

def analyze_xlsb(file_path):
    """Analyze an xlsb file and extract structure, data, and formulas."""
    
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
        print(f"\n")
        
        for sheet_name in sheet_names:
            print(f"\n{'=' * 80}")
            print(f"Sheet: {sheet_name}")
            print(f"{'=' * 80}")
            
            sheet_data = {
                "name": sheet_name,
                "data": [],
                "formulas": [],
                "summary": {}
            }
            
            with wb.get_sheet(sheet_name) as sheet:
                rows = list(sheet.rows())
                
                if not rows:
                    print("  (Empty sheet)")
                    analysis["sheets"].append(sheet_data)
                    continue
                
                # Find the actual data bounds
                max_col = 0
                non_empty_rows = 0
                formulas_found = []
                all_data = []
                
                for row_idx, row in enumerate(rows):
                    row_data = []
                    has_data = False
                    
                    for col_idx, cell in enumerate(row):
                        cell_value = cell.v
                        cell_formula = cell.f if hasattr(cell, 'f') and cell.f else None
                        
                        if cell_value is not None or cell_formula:
                            has_data = True
                            max_col = max(max_col, col_idx + 1)
                            
                        row_data.append({
                            "value": cell_value,
                            "formula": cell_formula
                        })
                        
                        if cell_formula:
                            cell_ref = f"{get_column_letter(col_idx)}{row_idx + 1}"
                            formulas_found.append({
                                "cell": cell_ref,
                                "formula": cell_formula,
                                "value": cell_value
                            })
                    
                    if has_data:
                        non_empty_rows += 1
                        all_data.append(row_data[:max_col])
                
                sheet_data["summary"]["total_rows"] = len(rows)
                sheet_data["summary"]["non_empty_rows"] = non_empty_rows
                sheet_data["summary"]["max_columns"] = max_col
                sheet_data["summary"]["formulas_count"] = len(formulas_found)
                sheet_data["formulas"] = formulas_found
                
                print(f"\n  Total Rows: {len(rows)}")
                print(f"  Non-Empty Rows: {non_empty_rows}")
                print(f"  Max Columns: {max_col}")
                print(f"  Formulas Found: {len(formulas_found)}")
                
                # Print header row (first row)
                if all_data:
                    print(f"\n  --- Header Row ---")
                    header_values = [cell["value"] for cell in all_data[0] if cell["value"] is not None]
                    for i, val in enumerate(header_values):
                        print(f"    Column {get_column_letter(i)}: {val}")
                
                # Print sample data (first 10 rows)
                print(f"\n  --- Sample Data (First 10 rows) ---")
                for row_idx, row in enumerate(all_data[:10]):
                    row_values = []
                    for cell in row:
                        if cell["value"] is not None:
                            row_values.append(str(cell["value"])[:30])
                        else:
                            row_values.append("")
                    print(f"    Row {row_idx + 1}: {' | '.join(row_values)}")
                
                # Print all formulas
                if formulas_found:
                    print(f"\n  --- Formulas Found ---")
                    for formula_info in formulas_found:
                        print(f"    {formula_info['cell']}: {formula_info['formula']}")
                        if formula_info['value'] is not None:
                            print(f"      -> Result: {formula_info['value']}")
                
                sheet_data["data"] = all_data
            
            analysis["sheets"].append(sheet_data)
    
    return analysis

if __name__ == "__main__":
    file_path = "/Users/gauravrai/projects/VehicleTracker/vehicle-tracking/public/Pradeep@2025.xlsb"
    analysis = analyze_xlsb(file_path)
    
    # Save analysis to JSON for reference
    with open("/Users/gauravrai/projects/VehicleTracker/vehicle-tracking/excel_analysis.json", "w") as f:
        # Convert to JSON-serializable format
        def make_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_serializable(v) for v in obj]
            elif hasattr(obj, '__iter__') and not isinstance(obj, str):
                return list(obj)
            else:
                try:
                    json.dumps(obj)
                    return obj
                except:
                    return str(obj)
        
        json.dump(make_serializable(analysis), f, indent=2, default=str)
    
    print(f"\n\n{'=' * 80}")
    print("Analysis complete! Full data saved to excel_analysis.json")
    print(f"{'=' * 80}")

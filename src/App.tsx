import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEvent, ColumnEditorOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import {
  InputNumber,
  InputNumberValueChangeEvent
} from "primereact/inputnumber";
import { ProductService } from "./service/ProductService";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Console } from "console";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

interface ColumnMeta {
  field: string;
  header: string;
}

interface Country {
  name: string;
  code: string;
}

export default function CellEditingDemo() {
  const [products, setProducts] = useState<Product[] | null>(null);

  const columns: ColumnMeta[] = [
    { field: "description", header: "Country" },
    { field: "code", header: "Code" },
    { field: "name", header: "Name" },
    { field: "quantity", header: "Quantity" },
    { field: "price", header: "Price" }
  ];

  useEffect(() => {
    ProductService.getProducts().then((data) => setProducts(data));
  }, []);

  const isPositiveInteger = (val: any) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    let n = Math.floor(Number(str));

    return n !== Infinity && String(n) === str && n >= 0;
  };

  const onCellEditComplete = (e: ColumnEvent) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    console.log(newValue);
    //console.log(newValue.length);
    console.log(newValue.name);

    switch (field) {
      case "quantity":
      case "price":
        if (isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "description":
        if (newValue) rowData[field] = newValue.name;
        else event.preventDefault();
        break;
      default:
        if (newValue.trim().length > 0) {
          rowData[field] = newValue;
        } else {
          console.log("before prevent default");
          event.preventDefault();
        }
        break;
    }
  };

  const cellEditor = (options: ColumnEditorOptions) => {
    if (options.field === "price") return priceEditor(options);
    else if (options.field === "description") return filterEditor(options);
    else return textEditor(options);
  };

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const filterEditor = (options: ColumnEditorOptions) => {
    const countries: Country[] = [
      { name: "Australia", code: "AU" },
      { name: "Brazil", code: "BR" },
      { name: "China", code: "CN" },
      { name: "Egypt", code: "EG" },
      { name: "France", code: "FR" },
      { name: "Germany", code: "DE" },
      { name: "India", code: "IN" },
      { name: "Japan", code: "JP" },
      { name: "Spain", code: "ES" },
      { name: "United States", code: "US" }
    ];

    const selectedCountryTemplate = (option: Country, props) => {
      if (option) {
        return (
          <div className="flex align-items-center">
            <img
              alt={option.name}
              src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
              className={`mr-2 flag flag-${option.code.toLowerCase()}`}
              style={{ width: "18px" }}
            />
            <div>{option.name}</div>
          </div>
        );
      }

      return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option: Country) => {
      return (
        <div className="flex align-items-center">
          <img
            alt={option.name}
            src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
            className={`mr-2 flag flag-${option.code.toLowerCase()}`}
            style={{ width: "18px" }}
          />
          <div>{option.name}</div>
        </div>
      );
    };

    return (
      <div className="flex justify-content-center">
        <Dropdown
          value={selectedCountry}
          onChange={(e: DropdownChangeEvent) => {
            //e.stopPropagation();
            setSelectedCountry(e.value);
            options.editorCallback!(e.target.value);
            console.log("filterEditor onChange triggered");
          }}
          options={countries}
          optionLabel="name"
          placeholder="Select a Country"
          filter
          valueTemplate={selectedCountryTemplate}
          itemTemplate={countryOptionTemplate}
          className="w-full md:w-14rem"
        />
      </div>
    );
  };

  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback(e.target.value)
        }
      />
    );
  };

  const priceEditor = (options: ColumnEditorOptions) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e: InputNumberValueChangeEvent) =>
          options.editorCallback(e.value)
        }
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  const priceBodyTemplate = (rowData: Product) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(rowData.price);
  };

  return (
    <div className="card p-fluid">
      <DataTable
        value={products}
        editMode="cell"
        tableStyle={{ minWidth: "50rem" }}
      >
        {columns.map(({ field, header }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              style={{ width: "25%" }}
              body={field === "price" && priceBodyTemplate}
              editor={(options) => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
            />
          );
        })}
      </DataTable>
    </div>
  );
}

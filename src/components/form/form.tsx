"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";

export type FieldType =
  | "text"
  | "number"
  | "tel"
  | "checkbox"
  | "select"
  | "coordinates"
  | "date"
  | "multiselect"
  | "array";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  isMulti?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  metaKey?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormConfig {
  sections: FormSection[];
  allowMultipleSections?: boolean;
}

interface FormProps {
  config: FormConfig;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

const FormComponent: React.FC<FormProps> = ({
  config,
  initialData = {},
  onSubmit,
  onCancel,
  isOpen = true,
}) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [sections, setSections] = useState<number[]>([0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (sectionIndex: number, field: FormField, value: any) => {
    if (config.allowMultipleSections) {
      const updatedData = { ...formData };

      if (!updatedData[config.sections[0].title]) {
        updatedData[config.sections[0].title] = [];
      }
      if (!updatedData[config.sections[0].title][sectionIndex]) {
        updatedData[config.sections[0].title][sectionIndex] = {};
      }

      if (field.name === "meta" && field.metaKey) {
        let metaData = updatedData[config.sections[0].title][sectionIndex].meta;
        if (!Array.isArray(metaData)) {
          metaData = [];
        }
        const index = metaData.findIndex(
          (item: any) => item.key === field.metaKey
        );
        if (index !== -1) {
          metaData[index].value = Array.isArray(value) ? value : [value];
        } else {
          metaData.push({
            key: field.metaKey,
            value: Array.isArray(value) ? value : [value],
          });
        }
        updatedData[config.sections[0].title][sectionIndex].meta = metaData;
      } else {
        updatedData[config.sections[0].title][sectionIndex][field.name] = value;
      }

      if (field.name === "cropNames") {
        updatedData[config.sections[0].title][sectionIndex]["dailyPrices"] = [];
      }
      setFormData(updatedData);
    } else {
      const newData = { ...formData };

      if (field.name === "meta" && field.metaKey) {
        let metaData = newData.meta;
        if (!Array.isArray(metaData)) {
          metaData = [];
        }
        const index = metaData.findIndex(
          (item: any) => item.key === field.metaKey
        );
        if (index !== -1) {
          metaData[index].value = Array.isArray(value) ? value : [value];
        } else {
          metaData.push({
            key: field.metaKey,
            value: Array.isArray(value) ? value : [value],
          });
        }
        newData.meta = metaData;
      } else {
        newData[field.name] = value;
      }

      if (field.name === "cropNames") {
        newData.dailyPrices = [];
      }
      console.log(newData);
      setFormData(newData);
    }
  };

  const addSection = () => {
    setSections([...sections, sections.length]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const updatedSections = sections.filter((_, i) => i !== index);
      setSections(updatedSections);
      const updatedData = { ...formData };
      if (updatedData[config.sections[0].title]) {
        updatedData[config.sections[0].title].splice(index, 1);
        setFormData(updatedData);
      }
    }
  };

  const handleCropPriceChange = (
    sectionIndex: number,
    field: FormField,
    cropName: string,
    price: string
  ) => {
    if (config.allowMultipleSections) {
      const updatedData = { ...formData };
      const sectionData =
        updatedData[config.sections[0].title]?.[sectionIndex] || {};
      let dailyPrices = sectionData.dailyPrices || [];
      const priceIndex = dailyPrices.findIndex(
        (p: any) => p.cropName === cropName
      );
      if (priceIndex !== -1) {
        dailyPrices[priceIndex] = { cropName, price };
      } else {
        dailyPrices.push({ cropName, price });
      }
      updatedData[config.sections[0].title][sectionIndex].dailyPrices =
        dailyPrices;
      setFormData(updatedData);
    } else {
      const newData = { ...formData };
      let dailyPrices = newData.dailyPrices || [];
      const priceIndex = dailyPrices.findIndex(
        (p: any) => p.cropName === cropName
      );
      if (priceIndex !== -1) {
        dailyPrices[priceIndex] = { cropName, price };
      } else {
        dailyPrices.push({ cropName, price });
      }
      newData.dailyPrices = dailyPrices;
      setFormData(newData);
    }
  };

  const renderField = (field: FormField, sectionIndex: number) => {
    let value: any;
    if (config.allowMultipleSections) {
      const sectionData =
        formData[config.sections[0].title]?.[sectionIndex] || {};
      if (field.name === "meta" && field.metaKey) {
        const metaArray = sectionData.meta || [];
        const metaObj = metaArray.find(
          (item: any) => item.key === field.metaKey
        );
        value = metaObj ? metaObj.value : [];
      } else {
        value = sectionData[field.name] || (field.isMulti ? [] : "");
      }
    } else {
      if (field.name === "meta" && field.metaKey) {
        const metaArray = formData.meta || [];
        const metaObj = metaArray.find(
          (item: any) => item.key === field.metaKey
        );
        value = metaObj ? metaObj.value : [];
      } else {
        value = formData[field.name] || (field.isMulti ? [] : "");
      }
    }

    if (field.name === "cropNames" && field.type === "multiselect") {
      const selectedCrops = Array.isArray(value) ? value : [];
      const dailyPrices = config.allowMultipleSections
        ? formData[config.sections[0].title]?.[sectionIndex]?.dailyPrices || []
        : formData.dailyPrices || [];

      return (
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <Select
            isMulti
            options={field.options?.map((option) => ({
              value: option,
              label: option,
            }))}
            value={selectedCrops.map((name: string) => ({
              value: name,
              label: name,
            }))}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions
                ? selectedOptions.map((option: any) => option.value)
                : [];
              updateField(sectionIndex, field, selectedValues);
            }}
            placeholder="Select crops..."
            className="text-sm"
            classNamePrefix="react-select"
            required={field.required}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                borderColor: "#e5e7eb",
                "&:hover": { borderColor: "#10b981" },
                boxShadow: "none",
                borderRadius: "0.375rem",
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: "#d1fae5",
                color: "#047857",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "#047857",
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: "#047857",
                "&:hover": { backgroundColor: "#f87171", color: "#ffffff" },
              }),
            }}
          />
          {selectedCrops.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedCrops.map((cropName: string) => {
                const cropPrice = dailyPrices.find(
                  (p: any) => p.cropName === cropName
                );
                return (
                  <div key={cropName} className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      {cropName}
                      <button
                        type="button"
                        onClick={() => {
                          const newCrops = selectedCrops.filter(
                            (c: string) => c !== cropName
                          );
                          updateField(sectionIndex, field, newCrops);
                          const newDailyPrices = dailyPrices.filter(
                            (p: any) => p.cropName !== cropName
                          );
                          if (config.allowMultipleSections) {
                            const sectionData =
                              formData[config.sections[0].title]?.[
                                sectionIndex
                              ] || {};
                            setFormData({
                              ...formData,
                              [config.sections[0].title]: {
                                ...formData[config.sections[0].title],
                                [sectionIndex]: {
                                  ...sectionData,
                                  dailyPrices: newDailyPrices,
                                },
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              dailyPrices: newDailyPrices,
                            });
                          }
                        }}
                        className="hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={cropPrice?.price || ""}
                      onChange={(e) =>
                        handleCropPriceChange(
                          sectionIndex,
                          field,
                          cropName,
                          e.target.value
                        )
                      }
                      className="w-24 px-2 py-1 border rounded-md text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      required
                      min={0}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    switch (field.type) {
      case "array":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={Array.isArray(value) ? value.join(", ") : value || ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                const arrayValue = inputValue
                  ? inputValue.split(",").map((item) => item.trim())
                  : [];
                updateField(sectionIndex, field, arrayValue);
              }}
              placeholder="Enter comma-separated values"
              className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required={field.required}
            />
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((item, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = [...value];
                        newArray.splice(index, 1);
                        updateField(sectionIndex, field, newArray);
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case "select":
        if (field.isMulti) {
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="flex flex-wrap gap-2">
              <select
                multiple
                value={selectedValues}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions
                  ).map((option) => option.value);
                  updateField(sectionIndex, field, selectedOptions);
                }}
                className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val) => (
                  <span
                    key={val}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => {
                        const newValues = selectedValues.filter(
                          (v) => v !== val
                        );
                        updateField(sectionIndex, field, newValues);
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        }
        return (
          <select
            value={value || ""}
            onChange={(e) => updateField(sectionIndex, field, e.target.value)}
            className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => updateField(sectionIndex, field, e.target.checked)}
            className="w-4 h-4 mt-1 text-green-500 focus:ring-green-500"
          />
        );

      case "coordinates":
        return (
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Lat"
              value={value?.latitude || ""}
              onChange={(e) =>
                updateField(sectionIndex, field, {
                  ...value,
                  latitude: Number(e.target.value),
                })
              }
              className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required={field.required}
            />
            <input
              type="number"
              placeholder="Long"
              value={value?.longitude || ""}
              onChange={(e) =>
                updateField(sectionIndex, field, {
                  ...value,
                  longitude: Number(e.target.value),
                })
              }
              className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required={field.required}
            />
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            value={value || ""}
            onChange={(e) =>
              updateField(
                sectionIndex,
                field,
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value
              )
            }
            className="w-full border rounded p-1 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            required={field.required}
            min={0}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-4 rounded shadow-lg border max-w-2xl w-full m-2 relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="border-b pb-2">
                <h2 className="text-lg font-medium text-green-700">
                  {section.title}
                </h2>
              </div>

              {config.allowMultipleSections && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addSection}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                  >
                    Add {section.title}
                  </button>
                </div>
              )}

              {sections.map((sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="border p-3 rounded space-y-3 bg-white shadow-sm"
                >
                  {config.allowMultipleSections && sections.length > 1 && (
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h4 className="text-base font-medium text-green-700">
                        {section.title} {sectionIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {section.fields.map((field) => (
                      <div key={field.name} className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </label>
                        {renderField(field, sectionIndex)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="flex space-x-2 pt-3 border-t">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-1.5 rounded hover:bg-green-600 text-sm font-medium"
            >
              Save
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border py-1.5 rounded hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormComponent;

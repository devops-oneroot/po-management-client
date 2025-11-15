"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  LucideArrowUp,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePlay,
  LucidePause,
} from "lucide-react";

function getNestedValue(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : undefined;
  }, obj);
}

function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const lastPart = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!(part in acc)) acc[part] = {};
    return acc[part];
  }, obj);
  target[lastPart] = value;
  return obj;
}

export type TableColumn<T> = {
  key: string;
  header: string;
  render?: (value: any) => React.ReactNode;
  filterOperators?: string[];
  type?: "audio";
  sortable?: boolean;
};

export type TableAction<T> = {
  name: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  renderAction?: (row: T) => React.ReactNode;
};

interface AudioState {
  playingAudio: string | null;
  audioDuration: number;
  audioCurrentTime: number;
}

type TableProps<T> = {
  data: any[];
  columns: TableColumn<T>[];
  onSort?: (key: string) => void;
  isLoading: boolean;
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  } | null;
  density?: "compact" | "comfortable";
  actions?: TableAction<T>[];
  editable?: string;
  onDataChange?: (newData: T[]) => void;
  pageSize?: number;
  meta?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  onPageChange?: (page: number) => void;
};

const skeletonStyles = {
  shimmer:
    "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
  skeleton: "bg-gray-200 rounded",
};

const SkeletonRow = React.memo(
  ({
    columns,
    density,
  }: {
    columns: TableColumn<any>[];
    density: "compact" | "comfortable";
  }) => {
    return (
      <tr className="border-b border-gray-200 h-12">
        {columns.map((_, index) => (
          <td
            key={index}
            className={`px-4 ${density === "compact" ? "py-1.5" : "py-3"}`}
          >
            <div className={`h-4 ${skeletonStyles.skeleton} w-3/4`} />
          </td>
        ))}
        {Array.from({ length: 2 }).map((_, index) => (
          <td
            key={`action-${index}`}
            className={`px-4 ${density === "compact" ? "py-1.5" : "py-3"}`}
          >
            <div className={`h-4 w-4 ${skeletonStyles.skeleton}`} />
          </td>
        ))}
      </tr>
    );
  }
);

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  onSort,
  sortConfig,
  density = "compact",
  isLoading,
  actions = [],
  editable,
  onDataChange,
  pageSize = 40,
  meta,
  onPageChange,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(meta?.currentPage || 1);
  const [{ playingAudio, audioDuration, audioCurrentTime }, setAudioState] =
    useState<AudioState>({
      playingAudio: null,
      audioDuration: 0,
      audioCurrentTime: 0,
    });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const recordsPerPage = meta?.itemsPerPage || pageSize;
  const totalPages =
    meta?.totalPages || Math.ceil(data.length / recordsPerPage);
  const totalItems = meta?.totalItems || data.length;
  const startIndex = (currentPage - 1) * recordsPerPage + 1;
  const endIndex = Math.min(currentPage * recordsPerPage, totalItems);
  const currentData = meta
    ? data
    : data.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
      );

  // Calculate dynamic height based on the number of items
  const rowHeight = density === "compact" ? 48 : 60; // Approximate height per row (h-12 = 48px for compact, 60px for comfortable)
  const headerHeight = density === "compact" ? 40 : 48; // Approximate header height (py-2 = 40px for compact, py-3 = 48px for comfortable)
  const maxHeight = 530; // Fixed height for 20 users
  const minRows = isLoading ? 10 : Math.min(totalItems, currentData.length); // Use 10 rows for skeleton loading, otherwise use actual data count
  const calculatedHeight = isLoading
    ? maxHeight
    : totalItems <= 20
    ? headerHeight + minRows * rowHeight
    : maxHeight; // Dynamic height for <= 20 users, fixed at 530px for > 20

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      onPageChange?.(page);
      if (audioRef.current) {
        audioRef.current.pause();
        setAudioState({
          playingAudio: null,
          audioDuration: 0,
          audioCurrentTime: 0,
        });
      }
    },
    [totalPages, onPageChange]
  );

  const handleAudioPlay = useCallback(
    (audioSrc: string) => {
      if (playingAudio === audioSrc) {
        audioRef.current?.pause();
        setAudioState({
          playingAudio: null,
          audioDuration: 0,
          audioCurrentTime: 0,
        });
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const newAudio = new Audio(audioSrc);
        audioRef.current = newAudio;
        newAudio.play();

        newAudio.onloadedmetadata = () => {
          setAudioState({
            playingAudio: audioSrc,
            audioDuration: newAudio.duration,
            audioCurrentTime: 0,
          });
        };

        newAudio.ontimeupdate = () => {
          setAudioState((prevState) => ({
            ...prevState,
            audioCurrentTime: newAudio.currentTime,
          }));
        };

        newAudio.onended = () => {
          setAudioState({
            playingAudio: null,
            audioDuration: 0,
            audioCurrentTime: 0,
          });
        };
      }
    },
    [playingAudio]
  );

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      rowIndex: number,
      path: string
    ) => {
      const newData = [...data];
      const updatedRow = { ...newData[rowIndex] };
      setNestedValue(updatedRow, path, e.target.value);
      newData[rowIndex] = updatedRow;
      onDataChange?.(newData);
    },
    [data, onDataChange]
  );

  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors ${
            currentPage === page
              ? "bg-green-100 text-green-700"
              : "hover:bg-green-50 text-gray-600"
          }`}
        >
          {page}
        </button>
      );
    }
    return buttons;
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="border rounded-lg shadow-black overflow-hidden shadow-sm bg-white">
      <div
        style={{
          height: `${calculatedHeight}px`,
          overflowY: totalItems > 20 ? "auto" : "hidden",
        }}
        className="overflow-x-auto"
      >
        <table className="w-full text-left border-collapse text-sm min-h-full">
          <thead className="sticky top-0 z-10 bg-green-50">
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 ${
                    density === "compact" ? "py-2" : "py-3"
                  } font-semibold text-gray-700`}
                >
                  {column.sortable !== false ? (
                    <button
                      className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                      onClick={() => onSort?.(column.key)}
                    >
                      <span>{column.header}</span>
                      {sortConfig?.key === column.key && (
                        <LucideArrowUp
                          className="w-4 h-4"
                          style={{
                            transform:
                              sortConfig.direction === "desc"
                                ? "rotate(180deg)"
                                : "none",
                          }}
                        />
                      )}
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              ))}
              {actions.map((action, index) => (
                <th
                  key={index}
                  className={`px-4 ${
                    density === "compact" ? "py-2" : "py-3"
                  } font-semibold text-gray-700 text-right`}
                >
                  <span title={action.name}>{action.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <SkeletonRow key={index} columns={columns} density={density} />
              ))
            ) : currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="border-b border-gray-200 hover:bg-green-50 transition-colors h-12"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 ${
                        density === "compact" ? "py-1.5" : "py-3"
                      } text-gray-600`}
                    >
                      {column.type === "audio" ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleAudioPlay(
                                String(getNestedValue(row, column.key))
                              )
                            }
                            className="p-1.5 hover:bg-green-100 rounded-full transition-colors"
                          >
                            {playingAudio ===
                            String(getNestedValue(row, column.key)) ? (
                              <LucidePause className="w-4 h-4 text-green-600" />
                            ) : (
                              <LucidePlay className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          {playingAudio ===
                            String(getNestedValue(row, column.key)) && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">
                                {Math.floor(audioCurrentTime / 60)}:
                                {Math.floor(audioCurrentTime % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                              <div className="relative w-24 h-1 bg-gray-300 rounded-full">
                                <div
                                  className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
                                  style={{
                                    width: `${
                                      (audioCurrentTime / audioDuration) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {Math.floor(audioDuration / 60)}:
                                {Math.floor(audioDuration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : column.render ? (
                        column.render(getNestedValue(row, column.key))
                      ) : editable === column.key ? (
                        <input
                          type="text"
                          value={String(getNestedValue(row, column.key) ?? "")}
                          onChange={(e) =>
                            handleInputChange(e, rowIndex, column.key)
                          }
                          className="w-full border rounded px-2 py-1 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                        />
                      ) : (
                        String(getNestedValue(row, column.key) ?? "-")
                      )}
                    </td>
                  ))}
                  {actions.map((action, actionIndex) => (
                    <td
                      key={actionIndex}
                      className={`px-4 ${
                        density === "compact" ? "py-1.5" : "py-3"
                      } text-right`}
                    >
                      {action.renderAction ? (
                        action.renderAction(row)
                      ) : (
                        <button
                          onClick={() => action.onClick(row)}
                          className="p-1.5 hover:bg-green-100 rounded-full transition-colors"
                          title={action.name}
                        >
                          <div className="w-4 h-4 text-green-600 hover:text-green-700">
                            {action.icon}
                          </div>
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="h-full">
                <td
                  colSpan={columns.length + actions.length}
                  className="text-center py-8 text-gray-500 h-full"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 20 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            Showing {startIndex} to {endIndex} of {totalItems.toLocaleString()}{" "}
            records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!meta?.hasPreviousPage}
              className="p-1.5 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LucideChevronLeft className="w-5 h-5 text-green-600" />
            </button>
            {paginationButtons}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!meta?.hasNextPage}
              className="p-1.5 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LucideChevronRight className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Table);

'use client';
import { isEmpty } from 'lodash';
import React, {
  DetailedHTMLProps,
  ReactNode,
  TableHTMLAttributes,
  ThHTMLAttributes,
  useState,
} from 'react';

interface DataTableProps {
  titleStyleProps?: DetailedHTMLProps<
    TableHTMLAttributes<HTMLTableElement>,
    HTMLTableElement
  >;
  records: { [key: string]: any }[];
  columns: {
    accessor: string;
    title?: string;
    titleProps?: DetailedHTMLProps<
      ThHTMLAttributes<HTMLTableHeaderCellElement>,
      HTMLTableHeaderCellElement
    >;
    render?: (record: DataTableProps['records'][0]) => ReactNode;
  }[];
  rowExpansion?: {
    columns: DataTableProps['columns'];
    records: { [key: string]: any }[];
  };
  onRowClick?: (data: DataTableProps['records'][0] | null) => void;
  loading?: boolean;
}

const DataTable = ({
  columns,
  titleStyleProps,
  records,
  rowExpansion,
  onRowClick,
  loading,
}: DataTableProps) => {
  const [selectedRow, setSelectedRow] = useState<
    DataTableProps['records'][0] | null
  >(null);
  return (
    <table {...titleStyleProps}>
      <thead
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#121212',
          color: 'white',
          fontSize: 12,
        }}
      >
        <tr>
          {columns.map((_, index) => {
            return (
              <th key={`${index}.th`} {..._?.titleProps}>
                <div style={{ display: 'flex', padding: '5px 10px' }}>
                  {_.title || _.accessor}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody
        style={{
          overflow: 'auto',
        }}
      >
        {records.map((_, index) => {
          const isTrue =
            selectedRow?.id === _?.id && !isEmpty(rowExpansion?.records);
          return (
            <React.Fragment key={`${index}.tr`}>
              <tr
                onClick={() => {
                  if (selectedRow?.id === _?.id) {
                    onRowClick && onRowClick(null);
                    setSelectedRow(null);
                  } else {
                    onRowClick && onRowClick(_);
                    setSelectedRow(_);
                  }
                }}
                style={{
                  backgroundColor: isTrue ? '#121212' : '',
                  color: isTrue ? 'white' : '',
                  cursor: 'pointer',
                }}
              >
                {columns.map((v, indexCol) => {
                  return (
                    <td key={`${indexCol}.td`}>
                      {(v.render && v?.render(_)) || (
                        <div style={{ fontSize: 12, padding: '5px 10px' }}>
                          {_[v.accessor]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* //ANCHOR - rowexpansion */}

              <td
                colSpan={2}
                style={{
                  display: isTrue ? '' : 'none',
                }}
              >
                <table
                  {...titleStyleProps}
                  style={{ border: '1px solid black' }}
                >
                  <thead
                    style={{
                      backgroundColor: '#121212',
                      color: 'white',
                      fontSize: 12,
                    }}
                  >
                    <tr>
                      {rowExpansion?.columns.map((_, index) => {
                        return (
                          <th key={`${index}.th`} {..._?.titleProps}>
                            <div
                              style={{
                                display: 'flex',
                                padding: '5px 10px',
                              }}
                            >
                              {_.title || _.accessor}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody style={{ overflow: 'auto' }}>
                    {rowExpansion?.records.map((_, index) => {
                      return (
                        <React.Fragment key={`${index}.tr`}>
                          <tr>
                            {rowExpansion?.columns.map(
                              (v: any, indexCol: number) => {
                                return (
                                  <td key={`${indexCol}.td`}>
                                    {(v.render && v?.render(_)) || (
                                      <div
                                        style={{
                                          fontSize: 12,
                                          padding: '5px 10px',
                                        }}
                                      >
                                        {_[v.accessor]}
                                      </div>
                                    )}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </td>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default DataTable;

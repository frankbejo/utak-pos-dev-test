'use client';
import DataTable from '@/app/components/DataTable';
import descriptorMapping from '@/app/utils/firebaseConfig/descriptorMapping';
import { toCurrency } from '@/app/utils/firebaseConfig/toCurrency';
import {
  Button,
  Divider,
  Drawer,
  TextInput,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useClickOutside } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  compact,
  isEmpty,
  omit,
  range,
  toNumber,
  uniqueId,
  upperFirst,
  values,
} from 'lodash';
import React, { useEffect, useState } from 'react';
import { InferType, array, object, string } from 'yup';
import MainLayout from '../../layouts/MainLayout';
import {
  change,
  create,
  discard,
  retrieve,
} from '../../utils/firebaseConfig/crudFirebase';

let productSchema = object({
  products: array(
    object({
      itemId: string().optional(),
      itemName: string().required(),
      itemCategory: string().required(),
      options: array(
        object({
          price: string().required(),
          cost: string().required(),
          stock: string().required(),
          descriptors: array(
            object({ key: string().required(), value: string().required() })
          ).required(),
          itemDescription: string().optional(),
        })
      ).required(),
    })
  ).required(),
});

export type IProduct = InferType<typeof productSchema>;

const Inventory = () => {
  const [drawerOpen, setDrawerOpen] = useState('');
  const drawerRef = useClickOutside(() => setDrawerOpen(''));
  const [products, setProducts] = useState<IProduct['products'] | [] | null>(
    []
  );
  const [selectedRecord, setSelectedRecord] = useState<{
    [key: string]: any;
  } | null>(null);
  const form = useForm<IProduct>({
    initialValues: {
      products: [
        {
          itemId: undefined,
          itemCategory: '',
          itemName: '',
          options: [
            {
              cost: '',
              descriptors: [
                {
                  key: '',
                  value: '',
                },
              ],
              price: '',
              stock: '',
              itemDescription: '',
            },
          ],
        },
      ],
    },
    validate: yupResolver(productSchema),
  });

  const getProducts = async () => {
    try {
      const res = await retrieve(`Product`).then((data) => data);
      const data = compact(values(res));
      console.log({ data });
      return data;
    } catch (error) {
      console.log({ error });
      return null;
    }
  };

  const handleToAddProducts = form.onSubmit(async (v) => {
    v.products.map(async (_) => {
      const data = omit(_, ['itemId']);
      try {
        const id = uniqueId();
        // @ts-ignore
        const res = await create(`Product/${id}`, { id: id, ...data });
        console.log({ res });
        notifications.show({
          popoverTarget: 'right',
          message: 'Successfully added product',
          styles: {
            root: {
              position: 'fixed',
              bottom: 20,
              right: 20,
              padding: 10,
              backgroundColor: 'palegreen',
              fontSize: 12,
            },
          },
          withCloseButton: false,
        });
        const productData = await getProducts();
        setProducts(productData);
        setDrawerOpen('');
        form.reset();
      } catch (error) {
        console.log({ error });
      }
    });
  });

  const handleToEditProducts = form.onSubmit((v) => {
    v.products.map(async (_) => {
      try {
        const res = await change(`Product/${_.itemId}`, { id: _.itemId, ..._ });
        console.log({ res });
        const data = await getProducts();
        setProducts(data);
        setSelectedRecord(null);
        setDrawerOpen('');
        notifications.show({
          popoverTarget: 'right',
          message: 'Successfully edited product',
          styles: {
            root: {
              position: 'fixed',
              bottom: 20,
              right: 20,
              padding: 10,
              backgroundColor: 'palegreen',
              fontSize: 12,
            },
          },
          withCloseButton: false,
        });
        form.reset();
      } catch (error) {
        console.log({ error });
      }
    });
  });

  const handleToDeleteProduct = async (id: string) => {
    try {
      const res = await discard(`Product/${id}`);
      const data = await getProducts();
      setProducts(data);
      notifications.show({
        popoverTarget: 'right',
        message: 'Successfully deleted product',
        styles: {
          root: {
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: 10,
            backgroundColor: 'palegreen',
            fontSize: 12,
          },
        },
        withCloseButton: false,
      });
      console.log({ res });
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    (async () => {
      const data = await getProducts();
      setProducts(data);
    })();
  }, []);

  return (
    <MainLayout>
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: 100,
          padding: 20,
          gap: 10,
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto',
            border: '1px solid black',
          }}
        >
          <DataTable
            loading
            titleStyleProps={{ width: '100%' }}
            columns={[
              {
                accessor: 'itemName',
                title: 'Item Name',
                render: ({ itemName }) => (
                  <div
                    style={{
                      display: 'flex',
                      padding: '5px 10px',
                      fontSize: 12,
                    }}
                  >
                    {itemName}
                  </div>
                ),
              },
              {
                accessor: 'itemCategory',
                title: 'Item Category',
                render: (data) => (
                  <div
                    style={{
                      display: 'flex',
                      padding: '5px 10px',
                      justifyContent: 'space-between',
                      fontSize: 12,
                    }}
                  >
                    <span>{upperFirst(data.itemCategory)}</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <UnstyledButton
                        onClick={(e) => {
                          console.log({ e });
                          e.stopPropagation();
                          setDrawerOpen('edit');
                          form.setValues({
                            // @ts-ignore
                            products: [{ itemId: data.id, ...data }],
                          });
                        }}
                        style={{ display: 'flex', alignContent: 'center' }}
                      >
                        <IconEdit size={10} />
                      </UnstyledButton>
                      <UnstyledButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToDeleteProduct(data.id);
                        }}
                        style={{ display: 'flex', alignContent: 'center' }}
                      >
                        <IconTrash size={10} />
                      </UnstyledButton>
                    </div>
                  </div>
                ),
              },
            ]}
            records={products || []}
            rowExpansion={{
              columns: [
                {
                  accessor: 'cost',
                  title: 'Cost',
                  render: (data) => {
                    return (
                      <div style={{ fontSize: 12, padding: '0 10px' }}>
                        <span>{toCurrency(toNumber(data.cost))}</span>
                      </div>
                    );
                  },
                },
                {
                  accessor: 'price',
                  title: 'Price',
                  render: (data) => {
                    return (
                      <div style={{ fontSize: 12, padding: '0 10px' }}>
                        <span>{toCurrency(toNumber(data.price))}</span>
                      </div>
                    );
                  },
                },
                {
                  accessor: 'stock',
                  title: 'Stock',
                  render: (data) => {
                    return (
                      <div style={{ fontSize: 12, padding: '0 10px' }}>
                        <span>{data.stock}</span>
                      </div>
                    );
                  },
                },
                {
                  accessor: 'descriptors',
                  title: 'Options',
                  render: (data) => {
                    return (
                      <div
                        style={{
                          fontSize: 12,
                          padding: '0 10px',
                          overflow: 'auto',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 5 }}>
                          {descriptorMapping(data.descriptors).map((v) => (
                            <span>{v}</span>
                          ))}
                        </div>
                      </div>
                    );
                  },
                },
              ],
              records: selectedRecord?.options || [],
            }}
            onRowClick={(record) => {
              setSelectedRecord(record);
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Button style={{ padding: 10 }} onClick={() => setDrawerOpen('add')}>
            Add Product
          </Button>
        </div>
      </div>
      <Drawer
        ref={drawerRef}
        position="bottom"
        styles={{
          root: {
            position: 'fixed',
            bottom: 0,
            margin: 'auto',
          },
          body: {
            width: '100vw',
            height: '100vh',
          },
          header: {
            display: 'flex',
            justifyContent: 'end',
            backgroundColor: '#121212',
          },
        }}
        withOverlay
        withCloseButton={false}
        onClose={() => {
          setDrawerOpen('');
          form.reset();
        }}
        opened={!isEmpty(drawerOpen)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            backgroundColor: '#121212',
            height: '100%',
            borderRadius: '20px 20px 0 0',
            color: 'white',
            gap: 20,
            overflow: 'auto',
            border: '2px solid black',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}
          >
            <span style={{ fontSize: 14 }}>Add Product</span>
            <UnstyledButton
              style={{
                display: 'flex',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
              }}
              onClick={() => {
                setDrawerOpen('');
                form.reset();
              }}
            >
              <IconX color="white" />
            </UnstyledButton>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (drawerOpen === 'add') {
                handleToAddProducts();
              } else {
                handleToEditProducts();
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 12,
              gap: 20,
            }}
          >
            {form.values.products.map(
              (v: { options: any[] }, indexProducts: number) => {
                return (
                  <React.Fragment key={`${indexProducts}.product`}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <TextInput
                        styles={{
                          root: {
                            flex: 1,
                          },
                          input: {
                            minWidth: 200,
                            width: '100%',
                            border: form.getInputProps(
                              `products.${indexProducts}.itemName`
                            ).error
                              ? '2px solid red'
                              : 'none',
                          },
                        }}
                        size="xs"
                        label={'Item Name'}
                        {...form.getInputProps(
                          `products.${indexProducts}.itemName`
                        )}
                        error
                      />
                      <TextInput
                        styles={{
                          root: { flex: 1 },
                          input: {
                            minWidth: 200,
                            width: '100%',
                            border: form.getInputProps(
                              `products.${indexProducts}.itemCategory`
                            ).error
                              ? '2px solid red'
                              : 'none',
                          },
                        }}
                        size="xs"
                        label={'Item Category'}
                        {...form.getInputProps(
                          `products.${indexProducts}.itemCategory`
                        )}
                        error
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                      }}
                    >
                      {indexProducts === 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 5,
                            alignContent: 'center',
                          }}
                        >
                          <span>Add Options</span>
                          <UnstyledButton
                            onClick={() => {
                              const firstDescriptors = v.options[0].descriptors;
                              form.insertListItem(
                                `products.${indexProducts}.options`,
                                {
                                  price: '',
                                  cost: '',
                                  stock: '',
                                  descriptors: firstDescriptors.map(
                                    (v: any) => {
                                      return {
                                        key: v.key,
                                        value: '',
                                      };
                                    }
                                  ),
                                  itemDescription: '',
                                }
                              );
                            }}
                            style={{
                              display: 'flex',
                            }}
                          >
                            <IconPlus size={10} />
                          </UnstyledButton>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 30,
                        }}
                      >
                        {v.options.map((option, indexOption) => {
                          return (
                            <div
                              key={`${indexOption}.option`}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'end',
                                }}
                              >
                                {v.options.length !== 1 && (
                                  <UnstyledButton
                                    onClick={() => {
                                      form.removeListItem(
                                        `products.${indexProducts}.options`,
                                        indexOption
                                      );
                                    }}
                                    style={{ display: 'flex' }}
                                  >
                                    <IconMinus size={10} />
                                  </UnstyledButton>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 5,
                                }}
                              >
                                <TextInput
                                  type="number"
                                  styles={{
                                    root: { flex: 1 },
                                    input: {
                                      minWidth: 200,
                                      width: '100%',
                                      border: form.getInputProps(
                                        `products.${indexProducts}.options.${indexOption}.cost`
                                      ).error
                                        ? '2px solid red'
                                        : 'none',
                                    },
                                  }}
                                  size="xs"
                                  label={'Cost'}
                                  {...form.getInputProps(
                                    `products.${indexProducts}.options.${indexOption}.cost`
                                  )}
                                  error
                                />
                                <TextInput
                                  type="number"
                                  styles={{
                                    root: { flex: 1 },
                                    input: {
                                      minWidth: 200,
                                      width: '100%',
                                      border: form.getInputProps(
                                        `products.${indexProducts}.options.${indexOption}.price`
                                      ).error
                                        ? '2px solid red'
                                        : 'none',
                                    },
                                  }}
                                  size="xs"
                                  label={'Price'}
                                  {...form.getInputProps(
                                    `products.${indexProducts}.options.${indexOption}.price`
                                  )}
                                  error
                                />
                                <TextInput
                                  type="number"
                                  styles={{
                                    root: { flex: 1 },
                                    input: {
                                      minWidth: 200,
                                      width: '100%',
                                      border: form.getInputProps(
                                        `products.${indexProducts}.options.${indexOption}.stock`
                                      ).error
                                        ? '2px solid red'
                                        : 'none',
                                    },
                                  }}
                                  size="xs"
                                  min={1}
                                  label={
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <span>Stock</span>
                                    </div>
                                  }
                                  {...form.getInputProps(
                                    `products.${indexProducts}.options.${indexOption}.stock`
                                  )}
                                  error
                                />
                              </div>
                              <div>
                                <Textarea
                                  resize="none"
                                  styles={{
                                    root: { flex: 1 },
                                    input: {
                                      width: '100%',
                                      height: 200,
                                      maxWidth: '100%',
                                    },
                                  }}
                                  size="xs"
                                  label={'Item Description'}
                                  {...form.getInputProps(
                                    `products.${indexProducts}.options.${indexOption}.itemDescription`
                                  )}
                                />
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 5,
                                    alignContent: 'center',
                                  }}
                                >
                                  <span>Add Descriptor</span>
                                  <UnstyledButton
                                    onClick={() => {
                                      const count = v.options.length;
                                      const firstDescriptors =
                                        v.options[indexOption].descriptors;
                                      const desc = [
                                        ...firstDescriptors,
                                        { key: '', value: '' },
                                      ];

                                      range(count).forEach((v) => {
                                        form.setFieldValue(
                                          `products.${indexProducts}.options.${v}.descriptors`,
                                          desc
                                        );
                                      });
                                    }}
                                    style={{
                                      display: 'flex',
                                    }}
                                  >
                                    <IconPlus size={10} />
                                  </UnstyledButton>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 10,
                                    padding: '0 0 10px 0',
                                    overflowX: 'auto',
                                  }}
                                >
                                  {option.descriptors.map(
                                    (descriptor: any, indexDescriptor: any) => {
                                      return (
                                        <div
                                          key={`${indexDescriptor}.descriptor`}
                                        >
                                          <TextInput
                                            styles={{
                                              root: { flex: 1 },
                                              input: {
                                                minWidth: 200,
                                                width: '100%',
                                                border: form.getInputProps(
                                                  `products.${indexProducts}.options.${indexOption}.stock`
                                                ).error
                                                  ? '2px solid red'
                                                  : 'none',
                                              },
                                            }}
                                            size="xs"
                                            label={
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  justifyContent:
                                                    'space-between',
                                                }}
                                              >
                                                <span>Descriptor</span>
                                                {option.descriptors.length !==
                                                  1 && (
                                                  <UnstyledButton
                                                    onClick={() => {
                                                      const count =
                                                        v.options.length;

                                                      range(count).forEach(
                                                        (v) => {
                                                          form.removeListItem(
                                                            `products.${indexProducts}.options.${v}.descriptors`,
                                                            indexDescriptor
                                                          );
                                                        }
                                                      );
                                                    }}
                                                    style={{ display: 'flex' }}
                                                  >
                                                    <IconMinus size={10} />
                                                  </UnstyledButton>
                                                )}
                                              </div>
                                            }
                                            {...form.getInputProps(
                                              `products.${indexProducts}.options.${indexOption}.descriptors.${indexDescriptor}.key`
                                            )}
                                            error
                                            onChange={(e) => {
                                              const count = v.options.length;
                                              range(count).forEach((v) => {
                                                form.setFieldValue(
                                                  `products.${indexProducts}.options.${v}.descriptors.${indexDescriptor}.key`,
                                                  e.currentTarget.value
                                                );
                                              });
                                            }}
                                          />
                                          <TextInput
                                            styles={{
                                              root: { flex: 1 },
                                              input: {
                                                minWidth: 200,
                                                width: '100%',
                                                border: form.getInputProps(
                                                  `products.${indexProducts}.options.${indexOption}.descriptors.${indexDescriptor}.value`
                                                ).error
                                                  ? '2px solid #ff6060'
                                                  : 'none',
                                              },
                                            }}
                                            size="xs"
                                            min={1}
                                            label={'Value'}
                                            {...form.getInputProps(
                                              `products.${indexProducts}.options.${indexOption}.descriptors.${indexDescriptor}.value`
                                            )}
                                            error
                                          />
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>

                              <Divider />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                );
              }
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'end',
                position: 'sticky',
                bottom: 0,
                padding: 10,
              }}
            >
              <Button
                style={{
                  padding: 10,
                  backgroundColor: '#121212',
                  color: 'white',
                }}
                type="submit"
              >
                {`${upperFirst(drawerOpen)} Products`}
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </MainLayout>
  );
};

export default Inventory;

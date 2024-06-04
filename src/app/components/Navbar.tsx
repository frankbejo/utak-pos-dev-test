'use client';
import { Drawer, NavLink, UnstyledButton } from '@mantine/core';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { IconLineDashed } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import React from 'react';

const Navbar = () => {
  const [isDrawerOpen, { toggle, close }] = useDisclosure(false);
  const drawerRef = useClickOutside(() => close());
  const pathname = usePathname();

  console.log({ pathname });

  return (
    <>
      <div
        style={{
          display: 'flex',
          padding: '4px 20px',
          backgroundColor: '#121212',
          flex: 1,
          width: '100%',
          height: 'fit',
          flexGrow: 0,
        }}
      >
        <div
          className="left"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <UnstyledButton
            styles={{ root: { border: 'none', backgroundColor: '#121212' } }}
            onClick={toggle}
          >
            <IconLineDashed color="white" />
          </UnstyledButton>
          <div className="logo" style={{ color: 'white', fontWeight: 'bold' }}>
            UTAK POS
          </div>
        </div>
        <div className="right"></div>
      </div>
      <Drawer
        ref={drawerRef}
        position="left"
        closeOnClickOutside
        closeOnEscape
        withOverlay
        withCloseButton={false}
        size={'xs'}
        styles={{
          root: {
            position: 'fixed',
            zIndex: 100,
            top: 0,
          },
          body: {
            backgroundColor: '#121212',
            width: 200,
            height: '100vh',
            borderRight: '2px solid white',
          },
          header: {
            display: 'flex',
            justifyContent: 'end',
            backgroundColor: '#121212',
          },
        }}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        onClose={close}
        opened={isDrawerOpen}
      >
        <ul>
          {[
            { nav: '/inventory', label: 'Inventory' },
            { nav: '/', label: 'About' },
          ].map((_, index) => {
            return (
              <React.Fragment key={index}>
                <li style={{ display: 'flex', fontSize: 12 }}>
                  <NavLink
                    href={_.nav}
                    label={_.label}
                    style={{
                      flex: 1,
                      padding: 10,
                      textDecoration: 'none',
                      color: 'white',
                    }}
                  />
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </Drawer>
    </>
  );
};

export default Navbar;

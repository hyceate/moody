import { Link } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { handleLogOut } from '@/actions/handleUser';
import { useAuth } from '@/context/authContext';
import { ProfileAvatar } from './avatar';
export const LoggedIn = () => {
  const { user } = useAuth();
  let avatar = '';
  let username = '';
  if (user) {
    avatar = user.avatarUrl;
    username = user.username;
  }
  return (
    <ul id="loggedIn" className="ml-3 flex items-center justify-end gap-5">
      <li className="mx-1">
        <Link to="/upload">
          <Button padding="5px">
            <AddIcon boxSize={5}></AddIcon>
          </Button>
        </Link>
      </li>
      <li className="flex items-center justify-center gap-1">
        <Link
          to={`/profile/${username}`}
          className="flex items-center rounded-full hover:outline"
        >
          <ProfileAvatar size="50px" src={avatar} />
        </Link>
        <Menu isLazy>
          {({ isOpen }) => (
            <>
              <MenuButton
                isActive={isOpen}
                as={Button}
                rounded="100%"
                aspectRatio={1 / 1}
                height="auto"
                width="25px"
                minWidth="unset"
                fontSize="1.5rem"
                padding="0px"
                backgroundColor="transparent"
                lineHeight="1"
              >
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </MenuButton>
              <MenuList paddingInline={2}>
                <MenuItem as={Link} to="/settings">
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  as={Button}
                  onClick={handleLogOut}
                  justifyContent="start"
                  backgroundColor="actions.pink.100"
                  _hover={{ bg: 'gray.500' }}
                  color="white"
                  lineHeight="unset"
                >
                  Log Out
                </MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      </li>
      <li></li>
    </ul>
  );
};

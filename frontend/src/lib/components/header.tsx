import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { SearchBar } from './searchbar';
import { LoginModal } from './login';
import { SignUpModal } from './signup';
import { LoggedIn } from './loggedIn';
import { useAuth } from '../context/authContext';

const NavLink = styled(Link)`
  font-weight: 700;
  padding-inline: 0.5rem;
  padding-block: 0.5rem;
  border-radius: 1000px;
  color: #000;
  &:hover {
    color: #76abae;
  }
  &:active {
    color: #22595c;
  }
`;
const ActionNavs = styled(Link)`
  display: block;
  font-weight: 700;
  padding-inline: 1rem;
  padding-block: 0.5rem;
  border-radius: 1000px;
  width: 100%;
  text-wrap: nowrap;
`;

// Component Start
export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const { isAuthenticated } = useAuth();

  const toggleForm = () => {
    setIsLoginForm((prev) => !prev);
    setIsRegistrationSuccess(false);
    const { hash } = window.location;
    if (hash === '#login') {
      window.location.hash = 'signup';
    } else if (hash === '#signup') {
      window.location.hash = 'login';
    }
  };
  const openLoginModal = () => {
    setIsLoginForm(true);
    setIsRegistrationSuccess(false);
    window.location.hash = 'login';
    onOpen();
  };
  const openSignUpModal = () => {
    setIsLoginForm(false);
    setIsRegistrationSuccess(false);
    window.location.hash = 'signup';
    onOpen();
  };
  const closeModal = () => {
    onClose();
    setIsRegistrationSuccess(false);
    history.replaceState(null, '', window.location.pathname);
  };

  useEffect(() => {
    const { hash } = window.location;
    if (hash === '#login') {
      setIsRegistrationSuccess(false);
      setIsLoginForm(true);
      onOpen();
    } else if (hash === '#signup') {
      setIsRegistrationSuccess(false);
      setIsLoginForm(false);
      onOpen();
    }
  }, [onOpen]);

  return (
    <>
      <header className="top-0 z-10 flex h-auto w-full flex-row items-center gap-3  bg-white px-2 py-4 max-md:flex-wrap md:sticky">
        <aside id="logo" className="-mt-1 px-2">
          <h1 className="text-4xl font-black">
            <Link
              to="/"
              className="rounded hover:text-[#76ABAE] active:text-[#22595c]"
            >
              moody.
            </Link>
          </h1>
        </aside>

        <nav id="left" className="text-xl font-black">
          <NavLink to="/">home</NavLink>
        </nav>
        <div id="searchWrapper" className="w-full flex-auto">
          <SearchBar />
        </div>

        <nav id="right" className="flex-1 text-xl ">
          {!isAuthenticated ? (
            <ul
              id="notLoggedIn"
              className="flex w-full min-w-48 flex-row items-center justify-end gap-1"
            >
              <li>
                <ActionNavs
                  id="login"
                  to="#login"
                  className="bg-slate-300 text-black transition-colors hover:bg-slate-700 hover:text-white"
                  onClick={openLoginModal}
                >
                  login
                </ActionNavs>
              </li>
              <li>
                <ActionNavs
                  id="signUp"
                  to="#signup"
                  className="bg-action text-white transition-colors hover:bg-rose-700"
                  onClick={openSignUpModal}
                >
                  sign up
                </ActionNavs>
              </li>
            </ul>
          ) : (
            <LoggedIn />
          )}
        </nav>
      </header>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent
          display="flex"
          alignItems="center"
          flexDir="column"
          pb="10px"
          width="100%"
          maxWidth="25rem"
        >
          <ModalHeader
            id="user-area"
            display="flex"
            alignItems="center"
            flexDir="column"
          >
            <h1 className="text-4xl font-bold">moody.</h1>
            <h2 className="my-2 text-2xl font-bold lowercase">
              {isLoginForm ? 'hello, Welcome back' : 'Welcome to moody'}
            </h2>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody id="forms">
            {isLoginForm ? (
              <>
                {isRegistrationSuccess && (
                  <Alert
                    status="success"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    variant="subtle"
                    width="100%"
                    mt="-1.5rem"
                    mb="1rem"
                  >
                    <AlertIcon />
                    <AlertTitle fontSize="lg">Successful Sign Up</AlertTitle>
                    Log in below!
                  </Alert>
                )}

                <LoginModal />
              </>
            ) : (
              <SignUpModal
                setIsLoginForm={setIsLoginForm}
                onRegistrationSuccess={() => setIsRegistrationSuccess(true)}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button mt="2rem" onClick={toggleForm} w="100">
              {isLoginForm
                ? 'No account? Sign up here!'
                : 'Have an account? Log in here'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

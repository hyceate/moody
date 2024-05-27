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
`;
const ActionNavs = styled(Link)`
  font-weight: 700;
  padding-inline: 1rem;
  padding-block: 0.5rem;
  border-radius: 1000px;
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
      <header className="md:sticky top-0 flex flex-row max-md:flex-wrap items-center h-auto w-full py-4 px-2 border-b-2 bg-white z-10 gap-3">
        <aside id="logo" className="px-2">
          <h1 className="text-4xl font-black">
            <Link to="/" className="hover:text-[#76ABAE] rounded">
              moody.
            </Link>
          </h1>
        </aside>

        <nav id="left" className="text-xl font-black">
          <NavLink to="/" className="hover:text-[#76ABAE]">
            home
          </NavLink>
          <NavLink to="/explore" className="hover:text-[#76ABAE]">
            explore
          </NavLink>
        </nav>
        <div id="searchWrapper" className="flex-auto w-full">
          <SearchBar />
        </div>

        <nav id="right" className="flex-1 text-xl ">
          {!isAuthenticated ? (
            <ul
              id="notLoggedIn"
              className="flex flex-row items-center justify-end gap-1 w-full min-w-[12rem]"
            >
              <li>
                <ActionNavs
                  id="login"
                  to="#login"
                  className="bg-slate-300 hover:bg-slate-700 text-black hover:text-white transition-colors"
                  onClick={openLoginModal}
                >
                  login
                </ActionNavs>
              </li>
              <li>
                <ActionNavs
                  id="signUp"
                  to="#signup"
                  className="bg-action hover:bg-rose-700 text-white transition-colors"
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
          <ModalHeader display="flex" alignItems="center" flexDir="column">
            <h1 className="text-4xl font-bold">moody.</h1>
            <h2 className="my-2 lowercase text-2xl font-bold">
              {isLoginForm ? 'hello, Welcome back' : 'Welcome to moody'}
            </h2>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoginForm ? (
              <>
                {isRegistrationSuccess ? (
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
                ) : null}

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

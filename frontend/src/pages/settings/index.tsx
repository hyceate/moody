import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/authContext';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
  ModalHeader,
  ModalFooter,
} from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import {
  Field,
  Form,
  Formik,
  FormikProps,
  FieldProps,
  FormikHelpers,
} from 'formik';
import {
  validateEmail,
  validateName,
  validatePassword,
  validateNewPassword,
} from '@/actions/validations';
import { endpoint } from '@/query/fetch';
import { GraphQLClient } from 'graphql-request';
import axios from 'axios';
import { ProfileAvatar } from '@/components/avatar';

interface FormValues {
  id: string;
  username: string;
  email: string;
  currentPassword: string | '';
  newPassword: string | '';
  confirmPassword: string | '';
}
interface updateResponse {
  updateAccount: {
    success: boolean;
    message: string;
    errorType: string;
  };
}
const updateProfile = `
mutation UpdateAccount($input: UpdateInput!) {
  updateAccount(input: $input){
    success
    message
    errorType
  }
}`;

// Settings page start
export default function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, user, refreshAuth } = useAuth();
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLabel, setShowLabel] = useState(true);
  const [showImagePin, setShowImagePin] = useState(false);
  useEffect(() => {
    document.title = 'User Settings';
  }, []);
  const toast = useToast();
  const handleTogglePassword = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
  ) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const uploadAvatar = async (file: File, userId: string) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('user', userId);
      const response = await axios.post(
        `http://localhost:3000/api/auth/upload-avatar`,
        formData,
        {
          withCredentials: true,
          timeout: 5000,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (/image\/*/.test(file.type)) {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
          setShowLabel(false);
          setShowImagePin(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (user && file) {
      try {
        const avatarPath = await uploadAvatar(file, user.id);
        refreshAuth();
        toast({
          position: 'bottom',
          title: 'Profile Image updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return avatarPath;
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };
  const createGraphQLClient = () => {
    return new GraphQLClient(endpoint, {
      credentials: 'include',
    });
  };
  const updateMutation = useMutation({
    mutationFn: async (input: FormValues) => {
      const client = createGraphQLClient();
      const response: updateResponse = await client.request(updateProfile, {
        input,
      });
      return response;
    },
  });

  if (!isAuthenticated || !user) return <Navigate to="/" replace></Navigate>;
  const id = user.id;
  const username = user.username;
  const email = user.email;
  const initialValues: FormValues = {
    id: id,
    username: username,
    email: email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError, resetForm }: FormikHelpers<FormValues>,
  ) => {
    const hasValues = Object.keys(values).some((key) => {
      if (key === 'currentPassword') return false;
      const value = values[key as keyof FormValues];
      const initialValue = initialValues[key as keyof FormValues];
      return value.trim() && value.trim() !== initialValue.trim();
    });
    if (hasValues) {
      try {
        await updateMutation.mutateAsync(values);
        if (updateMutation.data) {
          const { success, message, errorType } =
            updateMutation.data.updateAccount;
          if (success === false) {
            {
              errorType === 'incorrectPassword' &&
                setFieldError('currentPassword', message);
            }
            {
              errorType === 'matchPassword' &&
                setFieldError('confirmPassword', message);
            }
            {
              errorType === 'samePassword' &&
                setFieldError('newPassword', message);
            }
            setSubmitting(false);
          }
          setSubmitting(false);
        }
        resetForm();
        setSubmitting(false);
        toast({
          position: 'bottom',
          title: 'Profile updated.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        refreshAuth();
      } catch (error) {
        setSubmitting(false);
        return error;
      }
    } else {
      toast({
        position: 'bottom',
        title: 'No changes to submit.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
    setSubmitting(false);
  };

  return (
    <>
      <section className="mt-5 flex flex-col items-center justify-center gap-5 pb-10">
        <h1 className="text-2xl font-bold">edit profile</h1>
        <div className="mb-5 flex flex-col items-center justify-center gap-3">
          <ProfileAvatar size="150px" src={user.avatarUrl} />
          <Button onClick={onOpen}>Change Avatar</Button>
        </div>

        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            handleSubmit(values, actions);
          }}
        >
          {(props: FormikProps<FormValues>) => (
            <Form className="flex w-full min-w-[320px] flex-col items-center justify-center gap-4">
              <Field name="username" validate={validateName}>
                {({ field, form }: FieldProps<FormValues>) => (
                  <FormControl
                    id="username"
                    isInvalid={
                      !!(form.errors.username && form.touched.username)
                    }
                  >
                    <FormLabel htmlFor="username" mb="-.5rem">
                      Username
                    </FormLabel>
                    {form.errors.username && form.touched.username ? (
                      <FormErrorMessage>
                        {props.errors.username}
                      </FormErrorMessage>
                    ) : (
                      <FormHelperText>Min 2 characters</FormHelperText>
                    )}
                    <Input
                      {...field}
                      name="username"
                      value={props.values.username}
                      autoComplete="username"
                      mt=".1rem"
                      mb=".5rem"
                    />
                  </FormControl>
                )}
              </Field>

              <Field id="email" name="email" validate={validateEmail}>
                {({ field, form }: FieldProps<FormValues>) => (
                  <FormControl
                    id="email"
                    isInvalid={!!(form.errors.email && form.touched.email)}
                  >
                    <FormErrorMessage>{props.errors.email}</FormErrorMessage>
                    <FormLabel htmlFor="email">Email address</FormLabel>
                    <Input
                      {...field}
                      value={props.values.email}
                      autoComplete="email"
                      name="email"
                    />
                  </FormControl>
                )}
              </Field>

              <Field name="currentPassword" validate={validatePassword}>
                {({ field, form }: FieldProps<FormValues>) => (
                  <FormControl
                    id="currentPassword"
                    isInvalid={
                      !!(
                        form.errors.currentPassword &&
                        form.touched.currentPassword
                      )
                    }
                  >
                    <FormLabel htmlFor="currentPassword">Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...field}
                        name="currentPassword"
                        type={
                          showPassword.currentPassword ? 'text' : 'password'
                        }
                        pr="5rem"
                        value={props.values.currentPassword}
                        autoComplete="password"
                      />
                      <InputRightElement w="4.2rem">
                        <Button
                          onMouseDown={() =>
                            handleTogglePassword('currentPassword')
                          }
                          onMouseUp={() =>
                            handleTogglePassword('currentPassword')
                          }
                          size="sm"
                        >
                          {showPassword.currentPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {props.errors.currentPassword}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="newPassword" validate={validatePassword}>
                {({ field, form }: FieldProps<FormValues>) => (
                  <FormControl
                    id="newPassword"
                    isInvalid={
                      !!(form.errors.newPassword && form.touched.newPassword)
                    }
                  >
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...field}
                        name="newPassword"
                        type={showPassword.newPassword ? 'text' : 'password'}
                        pr="5rem"
                        value={props.values.newPassword}
                      />
                      <InputRightElement w="4.2rem">
                        <Button
                          onMouseDown={() =>
                            handleTogglePassword('newPassword')
                          }
                          onMouseUp={() => handleTogglePassword('newPassword')}
                          size="sm"
                        >
                          {showPassword.newPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {props.errors.newPassword}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field
                name="confirmPassword"
                validate={(value: string) =>
                  validateNewPassword(props.values.newPassword, value)
                }
              >
                {({ field, form }: FieldProps<FormValues>) => (
                  <FormControl
                    id="confirmPassword"
                    isInvalid={
                      !!(
                        form.errors.confirmPassword &&
                        form.touched.confirmPassword
                      )
                    }
                  >
                    <FormLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        {...field}
                        name="confirmPassword"
                        type={
                          showPassword.confirmPassword ? 'text' : 'password'
                        }
                        pr="5rem"
                        value={props.values.confirmPassword}
                      />
                      <InputRightElement w="4.2rem">
                        <Button
                          onMouseDown={() =>
                            handleTogglePassword('confirmPassword')
                          }
                          onMouseUp={() =>
                            handleTogglePassword('confirmPassword')
                          }
                          size="sm"
                        >
                          {showPassword.confirmPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {props.errors.confirmPassword}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <div className="mt-1.5 flex w-full flex-row gap-2">
                <Button width="100%">
                  <input type="reset"></input>
                </Button>
                <Button
                  isLoading={props.isSubmitting}
                  type="submit"
                  width="100%"
                  bg="actions.pink.50"
                  color="white"
                  _hover={{
                    background: 'actions.pink.100',
                  }}
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <ModalHeader>Upload an Profile Picture</ModalHeader>
            <ModalBody>
              <form
                encType="multipart/form-data"
                className="flex flex-col items-center justify-center gap-1"
                onSubmit={handleFormSubmit}
              >
                {showLabel && !showImagePin ? (
                  <div className="rounded-full hover:outline">
                    <FormLabel
                      className="cursor-pointer"
                      padding="0"
                      margin="0"
                    >
                      <div className="rounded-full bg-slate-200 p-5 text-center hover:bg-slate-300">
                        Click to Upload
                      </div>
                      <input
                        id="upload_avatar"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        name="avatar"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      ></input>
                    </FormLabel>
                  </div>
                ) : (
                  <div className="relative flex aspect-square w-40 flex-col items-center justify-center overflow-hidden rounded-full hover:outline">
                    <FormLabel
                      htmlFor="upload_avatar"
                      padding="0"
                      margin="0"
                      width="100%"
                      height="100%"
                    >
                      <img
                        src={imagePreview || ''}
                        alt="pin_image"
                        className="object-contain"
                      />
                      <input
                        id="upload_avatar"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        name="avatar"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      ></input>
                    </FormLabel>
                  </div>
                )}

                <ModalFooter display="flex" justifyContent="center">
                  <Button
                    type="submit"
                    bg="actions.pink.50"
                    color="white"
                    _hover={{ background: 'actions.pink.100' }}
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </section>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/authContext';
import {
  Avatar,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
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
} from 'actions/validations';
import { GraphQLClient } from 'graphql-request';

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
  const { isAuthenticated, user, refreshAuth } = useAuth();
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleTogglePassword = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
  ) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  useEffect(() => {
    document.title = 'User Settings';
  }, []);
  const endpoint = 'http://localhost:3000/api/graphql';
  const createGraphQLClient = () => {
    return new GraphQLClient(endpoint, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
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
        refreshAuth();
      } catch (error) {
        setSubmitting(false);
        return error;
      }
    } else {
      console.log('No changes to Submit');
    }
    setSubmitting(false);
  };
  return (
    <>
      <section className="flex flex-col justify-center items-center gap-5 mt-5 pb-10">
        <h1 className="text-2xl font-bold">edit profile</h1>
        <div className="flex flex-col justify-center items-center gap-3 mb-5">
          <Avatar boxSize="90px" />
          <Button>Change Avatar</Button>
        </div>

        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            handleSubmit(values, actions);
          }}
        >
          {(props: FormikProps<FormValues>) => (
            <Form className="flex flex-col justify-center items-center gap-4 w-full min-w-[320px]">
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
              <div className="flex flex-row mt-1.5 gap-2 w-full">
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
      </section>
    </>
  );
}

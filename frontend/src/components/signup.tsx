import { useState } from 'react';
import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import {
  Field,
  Form,
  Formik,
  FormikProps,
  FormikHelpers,
  FieldProps,
} from 'formik';
import { validateEmail, validateName, validatePassword } from '../actions/auth';
import { request } from 'graphql-request';
// type
type RegistrationSuccessHandler = () => void;
interface SignUpModalProps {
  setIsLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  onRegistrationSuccess: RegistrationSuccessHandler;
}

// Component start
export const SignUpModal = ({
  setIsLoginForm,
  onRegistrationSuccess,
}: SignUpModalProps) => {
  //states
  //password peek state
  const [show, setShow] = useState(false);
  const showPass = () => setShow(!show);
  // types
  interface FormValues {
    email: string;
    password: string;
    username: string;
  }
  interface SignUpResponse {
    signUp: {
      success: boolean;
      errorType: string;
      message: string;
    };
  }
  // initial
  const initialValues: FormValues = {
    email: '',
    password: '',
    username: '',
  };

  const handleSignup = async (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikHelpers<FormValues>,
  ) => {
    try {
      const signUp = `
        mutation SignUp($input: SignUpInput!) {
          signUp(input: $input) {
            success
            message
            errorType
          }
        }
      `;
      const response: SignUpResponse = await request(
        'http://localhost:3000/api/graphql',
        signUp,
        {
          input: values,
          timeout: 5000,
        },
      );
      if (response?.signUp?.success) {
        onRegistrationSuccess();
        setIsLoginForm(true);
        window.location.hash = 'login';
      } else {
        const { errorType, message } = response.signUp;
        if (errorType === 'both') {
          setFieldError(
            'username',
            'Account already exists under this username.',
          );
          setFieldError('email', 'Account already exists under this email.');
        } else if (errorType === 'username') {
          setFieldError('username', message);
        } else if (errorType === 'email') {
          setFieldError('email', message);
        } else {
          setFieldError('username', message);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
    setSubmitting(false);
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          handleSignup(values, actions);
        }}
      >
        {(props: FormikProps<FormValues>) => (
          <Form>
            <ul className="w-full max-w-[15rem]">
              {/* username */}
              <li className="mb-2">
                <Field name="username" validate={validateName}>
                  {({ field, form }: FieldProps<FormValues>) => (
                    <FormControl
                      isRequired
                      isInvalid={
                        !!(form.errors.username && form.touched.username)
                      }
                    >
                      <FormLabel
                        htmlFor="username"
                        fontWeight="600"
                        mb="-.5rem"
                      >
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
                        value={props.values.username}
                        autoComplete="username"
                        mt=".1rem"
                        mb=".5rem"
                      />
                    </FormControl>
                  )}
                </Field>
              </li>
              {/* email */}
              <li className="mb-2">
                <Field name="email" validate={validateEmail}>
                  {({ field, form }: FieldProps<FormValues>) => (
                    <FormControl
                      isRequired
                      isInvalid={!!(form.errors.email && form.touched.email)}
                    >
                      <FormLabel htmlFor="email" fontWeight="600" mb="-.5rem">
                        Email address
                      </FormLabel>
                      {form.errors.email && form.touched.email ? (
                        <FormErrorMessage>
                          {props.errors.email}
                        </FormErrorMessage>
                      ) : (
                        <FormHelperText>Enter a correct email.</FormHelperText>
                      )}
                      <Input
                        {...field}
                        value={props.values.email}
                        autoComplete="email"
                        mt=".1rem"
                        mb=".5rem"
                      />
                    </FormControl>
                  )}
                </Field>
              </li>
              {/* password */}
              <li className="mt-2">
                <Field name="password" validate={validatePassword}>
                  {({ field, form }: FieldProps<FormValues>) => (
                    <FormControl
                      isRequired
                      isInvalid={
                        !!(form.errors.password && form.touched.password)
                      }
                    >
                      <FormLabel
                        htmlFor="password"
                        mb="-.5rem"
                        fontWeight="600"
                      >
                        Password
                      </FormLabel>
                      <FormHelperText>Minimum 8 characters</FormHelperText>
                      <InputGroup>
                        <Input
                          {...field}
                          type={show ? 'text' : 'password'}
                          pr="5rem"
                          mt=".1rem"
                          mb=".5rem"
                          value={props.values.password}
                          autoComplete="password"
                        />
                        <InputRightElement w="4.2rem">
                          <Button onClick={showPass} size="sm">
                            {show ? 'Hide' : 'Show'}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {props.errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </li>
              <li>
                <Button
                  type="submit"
                  bg="actions.pink.50"
                  color="white"
                  _hover={{
                    background: 'actions.pink.100',
                  }}
                  py="1.4rem"
                  className="w-full text-lg font-bold mt-5 transition-colors"
                  rounded="full"
                  isLoading={props.isSubmitting}
                >
                  Sign Up
                </Button>
              </li>
            </ul>
          </Form>
        )}
      </Formik>
    </>
  );
};

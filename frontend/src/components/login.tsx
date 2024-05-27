import { useState } from 'react';
import { Button, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik';
import { handleLogIn } from '../actions/auth';
import { validateEmail, validatePassword } from '../actions/auth';
// component start
export const LoginModal = () => {
  const [show, setShow] = useState(false);
  const mouseDown = () => setShow(!show);
  const mouseUp = () => setShow(!show);

  interface FormValues {
    email: string;
    password: string;
  }
  const initialValues: FormValues = {
    email: '',
    password: '',
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          handleLogIn(values, actions);
        }}
      >
        {(props: FormikProps<FormValues>) => (
          <Form>
            <ul className="w-full max-w-[15rem]">
              <li>
                <Field name="email" validate={validateEmail}>
                  {({ field, form }: FieldProps<FormValues>) => (
                    <FormControl
                      isRequired
                      isInvalid={!!(form.errors.email && form.touched.email)}
                    >
                      <FormErrorMessage>{props.errors.email}</FormErrorMessage>
                      <FormLabel htmlFor="email" fontWeight="600">
                        Email address
                      </FormLabel>
                      <Input
                        {...field}
                        value={props.values.email}
                        autoComplete="email"
                      />
                    </FormControl>
                  )}
                </Field>
              </li>
              <li className="mt-2">
                <Field name="password" validate={validatePassword}>
                  {({ field, form }: FieldProps<FormValues>) => (
                    <FormControl
                      isRequired
                      isInvalid={
                        !!(form.errors.password && form.touched.password)
                      }
                    >
                      <FormLabel htmlFor="password" fontWeight="600">
                        Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          {...field}
                          type={show ? 'text' : 'password'}
                          pr="5rem"
                          value={props.values.password}
                          autoComplete="password"
                        />
                        <InputRightElement w="4.2rem">
                          <Button
                            onMouseDown={mouseDown}
                            onMouseUp={mouseUp}
                            size="sm"
                          >
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
                  _hover={{ background: 'actions.pink.100' }}
                  py="1.4rem"
                  className="w-full text-lg font-bold mt-5 transition-colors"
                  rounded="full"
                  isLoading={props.isSubmitting}
                >
                  Log In
                </Button>
              </li>
            </ul>
          </Form>
        )}
      </Formik>
    </>
  );
};

import {
  Box,
  Button,
  chakra,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListIcon,
  ListItem,
  VisuallyHidden,
} from '@chakra-ui/react';
import passwordValidator from 'password-validator';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import {
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiFillEye,
  AiFillEyeInvisible,
} from 'react-icons/ai';
import { type Modifier, usePopper } from 'react-popper';
import * as yup from 'yup';

type FormValues = {
  email: string;
  password: string;
};

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(12, 'The password should have a minium of 12 Characters')
  .is()
  .max(20, 'The password should have a maximum length of 20 characters')
  .has()
  .uppercase(
    undefined,
    'The password should have a minimum of 1 uppercase letter'
  )
  .has()
  .lowercase(
    undefined,
    'The password should have a minimum of 1 lowercase letter'
  )
  .has()
  .symbols(undefined, 'The password should have a minimum of 1 symbol')
  .has()
  .digits(undefined, 'The password should have a minimum of 1 digit')
  .has()
  .not()
  .spaces(undefined, 'The password should not have spaces');

const validatePassword = (password: string) => {
  const result = passwordSchema.validate(password, { details: true });
  if (result instanceof Boolean) {
    return [];
  }
  return result as PassWordValidation[];
};

const useYupValidationResolver = () =>
  useCallback(async (data: FormValues) => {
    try {
      const result = validatePassword(data.password);

      const validationSchema = yup.object({
        password: yup
          .string()
          .test('passwordTest', result.map((r) => r.message).join(', '), () => {
            if (result.length) {
              return false;
            }
            return true;
          }),
        email: yup.string().required().email(),
      });

      const values = await validationSchema.validate(data, {
        abortEarly: false,
      });

      return {
        values,
        errors: {},
      };
    } catch (errors) {
      if (errors instanceof yup.ValidationError) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path as string]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {}
          ),
        };
      }
    }
  }, []);

const sameWidth = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: ({ state }: any) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  effect: ({ state }: any) => {
    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
  },
};

const PasswordValidationList = ({
  passWorldValidations,
}: {
  passWorldValidations: PassWordValidation[];
}) => {
  const validations = useMemo(() => {
    if (passWorldValidations instanceof Array) {
      return passWorldValidations.map((val) => val.validation);
    }
    return [];
  }, [passWorldValidations]);

  const checkFn = (val: string) => {
    if (validations.includes(val)) {
      return false;
    }
    return true;
  };

  const validationList = [
    {
      name: 'min',
      output: 'Minium of 12 Characters',
    },
    {
      name: 'max',
      output: 'Maximum of 20 Characters',
    },
    {
      name: 'uppercase',
      output: 'Has Uppercase',
    },
    {
      name: 'lowercase',
      output: 'Has Lowercase',
    },
    {
      name: 'symbols',
      output: 'Has Symbols',
    },
    {
      name: 'digits',
      output: 'Has Digits',
    },
    {
      name: 'spaces',
      output: 'Has no Spaces',
    },
  ];

  return (
    <List>
      {validationList.map((vl) => {
        const { name, output } = vl;
        return (
          <ListItem
            key={name}
            textDecoration={checkFn(name) ? 'line-through' : 'none'}
          >
            <ListIcon
              as={checkFn(name) ? AiFillCheckCircle : AiFillCloseCircle}
              color={checkFn(name) ? 'green.500' : 'red.500'}
            />
            {output}
          </ListItem>
        );
      })}
    </List>
  );
};

type PassWordValidation = {
  validation: string;
  message: string;
};

function App() {
  const [showPassword, _setShowPassword] = useState(false);
  const [showConstraints, _setShowConstraints] = useState(false);
  const [passWorldValidations, setPassWorldValidations] = useState<
    PassWordValidation[]
  >([]);

  const setShowPassword = () => {
    _setShowPassword((prev) => !prev);
  };

  const setShowConstraints = () => {
    _setShowConstraints((prev) => !prev);
  };

  const resolver = useYupValidationResolver();

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormValues, undefined>({
    resolver: resolver as Resolver<FormValues, undefined>,
  });

  const passWordValue = watch('password');

  useEffect(() => {
    const list = validatePassword(passWordValue);
    setPassWorldValidations(list);
  }, [passWordValue]);

  const submitHandler = handleSubmit((values) => {
    console.log('🚀 ~ file: App.tsx:230 ~ submitHandler ~ values:', values);
  });

  // popper stuff
  const [referenceElement, setReferenceElement] =
    useState<HTMLInputElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const { attributes, styles, update } = usePopper(
    referenceElement,
    popperElement,
    {
      modifiers: [
        sameWidth as Partial<Modifier<unknown, object>>,
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
      ],
    }
  );
  // popper stuff

  const password = register('password');

  return (
    <Container mt="16" maxW="container.sm">
      <chakra.form noValidate onSubmit={submitHandler}>
        <FormControl mb="4" isInvalid={!!errors.email} isRequired>
          <FormLabel>Email</FormLabel>
          <Input {...register('email')} type="email" />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>
        <FormControl mb="4" isInvalid={!!errors.password} isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              {...password}
              onFocus={() => {
                setShowConstraints();
                if (update) {
                  update();
                }
              }}
              onBlur={(event) => {
                password.onBlur(event);
                setShowConstraints();
              }}
              ref={(input) => {
                password.ref(input);
                setReferenceElement(input);
              }}
              type={showPassword ? 'text' : 'password'}
            />
            <InputRightElement width="initial">
              <Button
                onClick={setShowPassword}
                fontSize="xl"
                backgroundColor="transparent"
                _hover={{ backgroundColor: 'transparent' }}
              >
                <VisuallyHidden>
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </VisuallyHidden>
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>
        <Box>
          <Button colorScheme="facebook" type="submit">
            Submit
          </Button>
        </Box>
      </chakra.form>
      <Box
        boxShadow="dark-lg"
        p="2"
        rounded="md"
        bg="white"
        display={showConstraints ? 'block' : 'none'}
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <PasswordValidationList {...{ passWorldValidations }} />
      </Box>
    </Container>
  );
}

export default App;

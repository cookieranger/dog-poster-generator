import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { AppDispatch, RootState } from './store';
import {
  type Option,
  type Breed,
  fetchBreeds,
  getOptions,
  generate,
  closeModal,
  addOption,
  removeOption,
} from './app.slice';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
};

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const options = useSelector(({ app }: RootState) => getOptions(app.options));
  const { open, loading, breeds, images } = useSelector(({ app }: RootState) => app);
  const [option, setOption] = useState<Option>({
    id: 'new',
    breed: null,
    sub: null,
    count: 0,
  });

  const total = useMemo(() => options.map((option) => option.count).reduce((a, b) => a + b, 0), [options]);

  useEffect(() => {
    dispatch(fetchBreeds());
  }, []);

  const handleGenerate = () => {
    dispatch(generate());
  };

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const handleAddOption = () => {
    dispatch(addOption(option));
  };

  const handleRemoveOption = (id: string) => {
    dispatch(removeOption(id));
  };

  const handleChangeBreed = (e: React.SyntheticEvent, value: Breed | null) => {
    setOption((option) => ({
      ...option,
      breed: value,
    }));
  };

  const handleChangeSubBreed = (e: React.SyntheticEvent, value: string | null) => {
    setOption((option) => ({
      ...option,
      sub: value,
    }));
  };

  const handleChangeCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOption((option) => ({
      ...option,
      count: parseInt(e.target.value),
    }));
  };

  return (
    <Container maxWidth="md">
      <Box mt={10}>
        <Paper sx={{ p: 2 }}>
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleGenerate} disabled={total === 0}>
            Generate
          </Button>

          {options.map((option) => (
            <Box key={option.id} display="flex" gap={2} mb={2}>
              <Autocomplete
                disabled
                disablePortal
                options={[]}
                value={option.breed}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Breed" />}
              />

              <Autocomplete
                disablePortal
                disabled
                options={[]}
                value={option.sub}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Sub-Breed" />}
              />

              <TextField
                disabled
                label="Image Count"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={option.count}
              />

              <IconButton color="secondary" onClick={() => handleRemoveOption(option.id)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          <Box display="flex" gap={2}>
            <Autocomplete
              disablePortal
              options={breeds}
              sx={{ width: 300 }}
              onChange={handleChangeBreed}
              renderInput={(params) => <TextField {...params} label="Breed" />}
            />

            <Autocomplete
              disablePortal
              disabled={option.breed === null || option.breed.subs.length === 0}
              options={option.breed?.subs ?? []}
              sx={{ width: 300 }}
              onChange={handleChangeSubBreed}
              renderInput={(params) => <TextField {...params} label="Sub-Breed" />}
            />

            <TextField
              label="Image Count"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={option.count}
              onChange={handleChangeCount}
            />

            <IconButton
              color="primary"
              disabled={
                option.breed === null || (option.breed.subs.length !== 0 && option.sub === null) || option.count === 0
              }
              onClick={handleAddOption}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Paper>

        <Modal open={open} onClose={handleCloseModal}>
          <Box sx={style}>
            <ImageList sx={{ minWidth: 450, height: 450 }} cols={3} rowHeight={164}>
              {(loading ? Array.from(new Array(total)) : images).map((image, index) => (
                <ImageListItem key={index}>
                  {image ? (
                    <img src={image} srcSet={image} alt={image} loading="lazy" />
                  ) : (
                    <Skeleton variant="rectangular" width={210} height={118} />
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        </Modal>
      </Box>
    </Container>
  );
}

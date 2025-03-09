import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";

import ListItemIcon from "@mui/material/ListItemIcon";
import HTMLTooltip from "@mui/material/Tooltip";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

import Button from "@mui/material/Button";

import { HFlex } from "@/components/atoms";

import { match } from "@/utils";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { recordKeyCombination } from "react-hotkeys";
import { getApplicationKeyMap } from "react-hotkeys";

const SettingHelp = ({ schema }) => (
  <ListItemIcon>
    <HTMLTooltip
      title={
        <Paper style={{ padding: "10px", fontSize: "small" }}>
          <Typography>{schema.help}</Typography>
          <Typography>
            Default: <em>{String(schema.validate(null))}</em>
          </Typography>
        </Paper>
      }
    >
      <HelpOutlineIcon />
    </HTMLTooltip>
  </ListItemIcon>
);

const TextSettingInput = ({ schema, value, handleChange }) => (
  <TextField
    label={schema.name}
    variant="outlined"
    style={{ margin: "0 8px" }}
    value={value}
    fullWidth
    onChange={handleChange}
  />
);

const SelectSettingInput = ({ schema, value, handleChange }) => (
  <FormControl variant="outlined" style={{ width: "100%", margin: "0 8px" }}>
    <InputLabel>{schema.name}</InputLabel>
    <Select fullWidth label={schema.name} value={value} onChange={handleChange}>
      {schema.choices.map((choice) => (
        <MenuItem value={choice} key={choice}>
          {choice}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const KeyInputDialog = ({ open, onClose, name }) => {
  const nullFunc = () => {};
  const [cancel, setCancel] = useState(() => nullFunc);

  useEffect(() => {
    if (open) {
      const cancelListening = recordKeyCombination(({ id, keys }) => {
        console.log("FOUND", id, keys);
        const keyMap = getApplicationKeyMap();
        console.log(keyMap);

        id = id.replace(/ /g, "space");
        onClose({ action: "save", keys: id });
      });

      setCancel(() => cancelListening);
    } else {
      setCancel(() => nullFunc);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        cancel();
        onClose();
      }}
    >
      <DialogTitle>Type in your shortcut for {name}</DialogTitle>
      <Button
        onClick={() => {
          cancel();
          onClose();
        }}
      >
        Cancel
      </Button>
    </Dialog>
  );
};

const KeySettingInput = ({ schema, value, handleChange }) => {
  const [dialogOpen, setDialogOpen] = useState(() => false);

  const onClose = (action) => {
    console.log("Closing with", action);
    if (action) handleChange({ target: { value: action.keys } });
    setDialogOpen(false);
  };

  return (
    <HFlex>
      <TextField
        label={schema.name}
        variant="outlined"
        style={{ margin: "0 8px" }}
        value={value}
        fullWidth
        onChange={handleChange}
      />
      <Button onClick={() => setDialogOpen(true)}>Input keys</Button>
      <KeyInputDialog open={dialogOpen} onClose={onClose} name={schema.name} />
    </HFlex>
  );
};

export const SettingInput = ({ schema, value, setValue }) => {
  const handleChange = (event) => setValue(event.target.value);

  const input = match(schema.inputType)
    .on("select", () => (
      <SelectSettingInput
        schema={schema}
        value={value}
        handleChange={handleChange}
      />
    ))
    .on("shortkey", () => (
      <KeySettingInput
        schema={schema}
        value={value}
        handleChange={handleChange}
      />
    ))
    .otherwise(() => (
      <TextSettingInput
        schema={schema}
        value={value}
        handleChange={handleChange}
      />
    ));
  const help = schema.help ? <SettingHelp schema={schema} /> : null;
  return (
    <>
      {input}
      {help}
    </>
  );
};

import MenuItem from "@mui/material/MenuItem";

import AddIcon from "@mui/icons-material/Add";

import { Input } from "@/components/molecules";
import { Menu } from "@mui/material";

export const AddUriMenu = ({ mopidy, ...props }) => {
  return (
    <Menu keepMounted {...props} onKeyPress={() => {}}>
      <MenuItem>
        <Input
          label={"URI"}
          icon={<AddIcon />}
          action={(uri) => {
            mopidy.tracklist.add({ uris: [uri] });
            props.onClose();
          }}
        />
      </MenuItem>
    </Menu>
  );
};

****************************
Mopidy-Mowecl
****************************

.. image:: https://img.shields.io/pypi/v/Mopidy-Mowecl
    :target: https://pypi.org/project/Mopidy-Mowecl/
    :alt: Latest PyPI version

Web client providing a clean and ergonomic interface to Mopidy.

Presentation
============

- Dual panel library / tracklist
- Library / playlists / search results displayed as a single tree view
- Drag and drop from library to tracklist, and inside tracklist
- Save tracklist + current track as a bookmark (virtual playlist)
- Configurable hotkeys for playback and volume control
- Basic color theming

.. image:: https://mopidy.com/media/ext/mowecl.png
   :target: https://mopidy.com/media/ext/mowecl.png
   :alt: Preview
   :width: 700px

Implementation
..............

Mopidy-Mowecl is written in Javascript, and is built upon React, Redux and Material-ui.


Installation
============

Depending on your setup, install either by running::

    # When mopidy was installed with pip
    python3 -m pip install Mopidy-Mowecl

or::

    # When mopidy was installed as a package or pip using sudo
    sudo python3 -m pip install Mopidy-Mowecl


Configuration
=============

Mowecl can both be configured in-app, and through the mopidy configuration file. Values set in the configuration files will act as default values for the clients, that can then override theme as they wish (clients configuration is stored in the browser data).

Here is are the available settings (and default values) of Mowecl in the Mopidy configuration file::

    [mowecl]
    enabled = true

    # generic config
    seek_update_interval = 500
    search_history_length = 10

    # theme config 
    ## light or dark
    theme_type = light
    background_color = #fdf6e3
    text_color = #002b36
    primary_color = #268bd2

    # Hotkeys, use web config to find the right parameters
    key_play_pause = space+Control
    key_next_track = ArrowRight
    key_previous_track = 
    key_rewind_track = ArrowLeft
    key_volume_up = ArrowUp
    key_volume_down = ArrowDown


Theming
.......

Basic theming is available in the configuration, with the following options:

- Background color
- Text color
- Highlight color

For example, you can use the following settings:

+------------------+-----------------------+----------------------+
|                  | `Solarized`_ (light)  | `Blueberry`_ (dark)  |
+==================+=======================+======================+
| Background color | #fdf6e3               | #232937              |
+------------------+-----------------------+----------------------+
| Text color       | #002b36               | #7390aa              |
+------------------+-----------------------+----------------------+
| Highlight color  | #268bd2               | #27e8a7              |
+------------------+-----------------------+----------------------+

.. _Blueberry: https://github.com/peymanslh/vscode-blueberry-dark-theme
.. _Solarized: https://en.wikipedia.org/wiki/Solarized_(color_scheme)


Building
=======================================

Mowecl is a React application served by a python app. Building the application thus requires tools from both the javascript and the python ecosystem.

Requirements
.......................................

- The `yarn` program
- The `setuptools` and `wheel` python packages (installable via `pip`)

Steps
.......................................

From the root of Mowecl directory, running the following commands will build the web application,, and then build the mowecl python package in the `dist` folder.

.. code-block:: bash

    cd mowecl_react
    yarn install
    yarn build
    cd ..
    python3 setup.py sdist bdist_wheel
    ls dist

You can then install the built package with pip, e.g.
::

    pip3 install dist/Mopidy_Mowecl-X.X.X-py3-none-any.whl

Development
.......................................

To run Mowecl in develop mode, do the following:

.. code-block:: bash

    cd mowecl_react
    yarn install
    yarn start

Changelog
=======================================

v0.3.5
........................................

- Parse configuration from mopidy
- Add uri button
- Fix volume increase/decrease

v0.3.4
........................................

- Configurable hotkeys for playback and volume control
- Some performance improvements


v0.3.3
........................................

- Color theming


v0.3.2
........................................

- Global hotkeys: space for play/pause
- Display track length in tracklist
- Light/dark theme
- New version notification


v0.3.1
........................................

- Search history
- Highlight of hovered library / tracklist item
- Some fixes


v0.2.0
........................................

- Initial release.



PROJECT resources
=================

- `Mopidy extension page <https://mopidy.com/ext/mowecl>`_
- `Source code <https://github.com/sapristi/mopidy-mowecl>`_
- `Issue tracker <https://github.com/sapristi/mopidy-mowecl/issues>`_


Credits
=======

- Original author: `Mathias Millet <https://github.com/sapristi>`__
- Current maintainer: `Mathias Millet <https://github.com/sapristi>`__
- `Contributors <https://github.com/sapristi/mopidy-mowecl/graphs/contributors>`_

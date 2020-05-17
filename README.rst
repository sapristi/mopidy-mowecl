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

Before starting Mopidy, you must add configuration for
Mopidy-Mowecl to your Mopidy configuration file::

    [mowecl]
    # No configuration required

In-app configuration
....................

Several configuration options are available in the web application:

 - Mopidy websocket URL: mostly for development purposes, or if you are exposing mopidy websocket on a custom port
 - Progress update interval: time interval (ms) at which the song progress bar will update.
 - Search history length: max number of items in the search history


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

Changelog
=======================================


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
- `Changelog <https://github.com/sapristi/mopidy-mowecl/blob/master/CHANGELOG.rst>`_


Credits
=======

- Original author: `Mathias Millet <https://github.com/sapristi>`__
- Current maintainer: `Mathias Millet <https://github.com/sapristi>`__
- `Contributors <https://github.com/sapristi/mopidy-mowecl/graphs/contributors>`_

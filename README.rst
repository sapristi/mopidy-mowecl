****************************
Mopidy-Mowecl
****************************

.. image:: https://img.shields.io/pypi/v/Mopidy-Mowecl
    :target: https://pypi.org/project/Mopidy-Mowecl/
    :alt: Latest PyPI version

.. image:: https://img.shields.io/circleci/build/gh/sapristi/mopidy-mowecl
    :target: https://circleci.com/gh/sapristi/mopidy-mowecl
    :alt: CircleCI build status

Web client providing a clean and ergonomic interface to Mopidy.

Presentation
============

- Dual panel library / tracklist
- Library / playlists / search results displayed as a single tree view
- Drag and drop from library to tracklist, and inside tracklist
- Save tracklist + current track as a bookmark (virtual playlist)
- Space play/pause hotkey
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

Install by running::

    python3 -m pip install Mopidy-Mowecl


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
 - Search history lenght: max number of items in the search history


Theming
.......

Basic theming is available in the configuration, with the following options:

 - Background color
 - Text color
 - Highlight color

For example, set these values for a dark mode based on the `Blueberry theme`_:

 - Background color: ``#232937``
 - Text color: ``#7390aa``
 - Highlight color: ``#27e8a7``


.. _Blueberry theme: https://github.com/peymanslh/vscode-blueberry-dark-theme

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
